import { useState, useCallback } from 'react';
import { X, Upload, FileSpreadsheet, AlertCircle, CheckCircle, Loader2, ArrowRight, ArrowLeft, Link2, Plus } from 'lucide-react';
import * as XLSX from 'xlsx';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface ImportedStudent {
    name: string;
    email: string;
    phone?: string;
    goal?: string;
    weight?: number;
    height?: number;
    plan_type?: string;
    birth_date?: string;
    gender?: string;
    notes?: string;
    custom_data?: Record<string, any>;
}

interface ExcelImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

// System fields that can be mapped
const SYSTEM_FIELDS: { key: string; label: string; required: boolean; isSystem: boolean }[] = [
    { key: 'name', label: 'Nome', required: true, isSystem: true },
    { key: 'email', label: 'Email', required: true, isSystem: true },
    { key: 'phone', label: 'Telefone', required: false, isSystem: true },
    { key: 'goal', label: 'Objetivo', required: false, isSystem: true },
    { key: 'weight', label: 'Peso (kg)', required: false, isSystem: true },
    { key: 'height', label: 'Altura (cm)', required: false, isSystem: true },
    { key: 'plan_type', label: 'Tipo de Plano', required: false, isSystem: true },
    { key: 'birth_date', label: 'Data de Nascimento', required: false, isSystem: true },
    { key: 'gender', label: 'Sexo', required: false, isSystem: true },
    { key: 'notes', label: 'Observações', required: false, isSystem: true },
];

// Convert Excel serial date number to ISO date string (YYYY-MM-DD)
function excelDateToISO(excelDate: number | string): string | null {
    if (typeof excelDate === 'string') {
        if (excelDate.includes('/') || excelDate.includes('-')) {
            const parts = excelDate.split(/[/\-]/);
            if (parts.length === 3) {
                let year, month, day;
                if (parts[0].length <= 2 && parts[2].length === 4) {
                    day = parts[0].padStart(2, '0');
                    month = parts[1].padStart(2, '0');
                    year = parts[2];
                } else if (parts[0].length === 4) {
                    year = parts[0];
                    month = parts[1].padStart(2, '0');
                    day = parts[2].padStart(2, '0');
                } else {
                    month = parts[0].padStart(2, '0');
                    day = parts[1].padStart(2, '0');
                    year = parts[2];
                }
                return `${year}-${month}-${day}`;
            }
        }
        const num = parseFloat(excelDate);
        if (!isNaN(num) && num > 1000) {
            excelDate = num;
        } else {
            return null;
        }
    }

    if (typeof excelDate === 'number' && excelDate > 0) {
        const excelEpoch = new Date(Date.UTC(1899, 11, 30));
        const jsDate = new Date(excelEpoch.getTime() + excelDate * 24 * 60 * 60 * 1000);
        const year = jsDate.getUTCFullYear();
        const month = String(jsDate.getUTCMonth() + 1).padStart(2, '0');
        const day = String(jsDate.getUTCDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    return null;
}

type Step = 'upload' | 'mapping' | 'preview' | 'result';

interface FieldMapping {
    excelColumn: string;
    systemField: string; // Can be system field key or custom field name
    isCustom: boolean;
    customLabel?: string;
}

export default function ExcelImportModal({ isOpen, onClose, onSuccess }: ExcelImportModalProps) {
    const { professional } = useAuth();
    const [step, setStep] = useState<Step>('upload');
    const [file, setFile] = useState<File | null>(null);
    const [rawData, setRawData] = useState<any[]>([]);
    const [excelColumns, setExcelColumns] = useState<string[]>([]);
    const [mappings, setMappings] = useState<FieldMapping[]>([]);
    const [customFields, setCustomFields] = useState<{ key: string; label: string }[]>([]);
    const [parsedData, setParsedData] = useState<ImportedStudent[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [error, setError] = useState('');
    const [importResult, setImportResult] = useState<{ success: number; failed: number } | null>(null);
    const [newFieldName, setNewFieldName] = useState('');
    const [showNewFieldInput, setShowNewFieldInput] = useState<string | null>(null);

    // All available fields (system + custom)
    const allFields = [
        ...SYSTEM_FIELDS,
        ...customFields.map(cf => ({ key: `custom_${cf.key}`, label: cf.label, required: false, isSystem: false }))
    ];

    // Reset state when closing
    const handleClose = () => {
        setStep('upload');
        setFile(null);
        setRawData([]);
        setExcelColumns([]);
        setMappings([]);
        setCustomFields([]);
        setParsedData([]);
        setError('');
        setImportResult(null);
        setNewFieldName('');
        setShowNewFieldInput(null);
        onClose();
    };

    // Step 1: Parse file and extract columns
    const parseFile = useCallback(async (file: File) => {
        setIsLoading(true);
        setError('');

        try {
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

            if (jsonData.length === 0) {
                setError('Planilha vazia ou formato inválido');
                setIsLoading(false);
                return;
            }

            // Extract column names from first row
            const columns = Object.keys(jsonData[0] as object);
            setExcelColumns(columns);
            setRawData(jsonData);

            // Auto-suggest mapping based on common names
            const suggestions: Record<string, string> = {
                'nome': 'name', 'name': 'name', 'aluno': 'name', 'cliente': 'name',
                'email': 'email', 'e-mail': 'email',
                'telefone': 'phone', 'phone': 'phone', 'celular': 'phone', 'whatsapp': 'phone', 'fone': 'phone',
                'objetivo': 'goal', 'goal': 'goal', 'meta': 'goal',
                'peso': 'weight', 'weight': 'weight',
                'altura': 'height', 'height': 'height',
                'plano': 'plan_type', 'plan': 'plan_type', 'tipo de plano': 'plan_type', 'pacote': 'plan_type',
                'data de nascimento': 'birth_date', 'nascimento': 'birth_date', 'birth_date': 'birth_date',
                'aniversário': 'birth_date', 'data nascimento': 'birth_date', 'dt nascimento': 'birth_date',
                'sexo': 'gender', 'gênero': 'gender', 'gender': 'gender',
                'observações': 'notes', 'notas': 'notes', 'notes': 'notes', 'obs': 'notes', 'observacao': 'notes',
            };

            const initialMappings: FieldMapping[] = columns.map(col => {
                const normalized = col.toLowerCase().trim();
                const suggested = suggestions[normalized];
                return {
                    excelColumn: col,
                    systemField: suggested || '',
                    isCustom: false,
                };
            });

            setMappings(initialMappings);
            setStep('mapping');
        } catch (err) {
            console.error('Parse error:', err);
            setError('Erro ao processar arquivo. Verifique o formato.');
        }

        setIsLoading(false);
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setImportResult(null);
            parseFile(selectedFile);
        }
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && (droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.xls') || droppedFile.name.endsWith('.csv'))) {
            setFile(droppedFile);
            setImportResult(null);
            parseFile(droppedFile);
        } else {
            setError('Formato inválido. Use .xlsx, .xls ou .csv');
        }
    }, [parseFile]);

    // Update mapping for a column
    const updateMapping = (excelColumn: string, systemField: string) => {
        setMappings(prev => prev.map(m =>
            m.excelColumn === excelColumn
                ? { ...m, systemField, isCustom: systemField.startsWith('custom_') }
                : m
        ));
    };

    // Add new custom field
    const addCustomField = (excelColumn: string, fieldName: string) => {
        if (!fieldName.trim()) return;

        const key = fieldName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');

        // Check if already exists
        if (customFields.some(cf => cf.key === key)) {
            setError('Este campo personalizado já existe');
            return;
        }

        // Add to custom fields
        setCustomFields(prev => [...prev, { key, label: fieldName }]);

        // Update mapping
        updateMapping(excelColumn, `custom_${key}`);

        // Reset input
        setNewFieldName('');
        setShowNewFieldInput(null);
    };

    // Step 2: Apply mapping and create preview
    const applyMapping = () => {
        // Check required fields
        const mappedFields = mappings.map(m => m.systemField);
        if (!mappedFields.includes('name') || !mappedFields.includes('email')) {
            setError('Os campos "Nome" e "Email" são obrigatórios');
            return;
        }

        // Apply mapping to data
        const mapped: ImportedStudent[] = rawData.map(row => {
            const student: ImportedStudent = { name: '', email: '', custom_data: {} };

            mappings.forEach(mapping => {
                if (!mapping.systemField || !row[mapping.excelColumn]) return;

                const value = row[mapping.excelColumn];
                const field = mapping.systemField;

                // Handle custom fields
                if (field.startsWith('custom_')) {
                    const customKey = field.replace('custom_', '');
                    student.custom_data![customKey] = String(value).trim();
                    return;
                }

                // Handle system fields
                if (field === 'weight' || field === 'height') {
                    const numValue = parseFloat(String(value).replace(',', '.'));
                    if (!isNaN(numValue)) {
                        (student as any)[field] = numValue;
                    }
                } else if (field === 'birth_date') {
                    const isoDate = excelDateToISO(value);
                    if (isoDate) {
                        student.birth_date = isoDate;
                    }
                } else if (field === 'gender') {
                    const genderValue = String(value).toLowerCase();
                    if (genderValue.includes('masc') || genderValue === 'm') {
                        student.gender = 'male';
                    } else if (genderValue.includes('fem') || genderValue === 'f') {
                        student.gender = 'female';
                    }
                } else {
                    (student as any)[field] = String(value).trim();
                }
            });

            return student;
        });

        // Filter valid rows
        const valid = mapped.filter(s => s.name && s.email);
        setParsedData(valid);

        if (valid.length === 0) {
            setError('Nenhum registro válido após o mapeamento');
            return;
        }

        setError('');
        setStep('preview');
    };

    // Step 3: Import to Supabase
    const handleImport = async () => {
        if (!professional?.id) {
            setError('Você precisa estar logado para importar alunos');
            return;
        }

        setIsImporting(true);
        setError('');

        let success = 0;
        let failed = 0;
        const errors: string[] = [];

        for (const student of parsedData) {
            // Build insert object with only non-null values
            const insertData: any = {
                professional_id: professional.id,
                name: student.name,
                email: student.email,
                status: 'active',
            };

            // Add optional fields only if they have values
            if (student.phone) insertData.phone = student.phone;
            if (student.goal) insertData.goal = student.goal;
            if (student.weight) insertData.weight = student.weight;
            if (student.height) insertData.height = student.height;
            if (student.plan_type) insertData.plan_type = student.plan_type;
            if (student.birth_date) insertData.birth_date = student.birth_date;
            if (student.gender) insertData.gender = student.gender;
            if (student.notes) insertData.notes = student.notes;

            // Use upsert to update if exists (based on professional_id + email)
            let result = await supabase.from('students').upsert(
                {
                    ...insertData,
                    custom_data: student.custom_data || {},
                },
                {
                    onConflict: 'professional_id,email',
                    ignoreDuplicates: false // Update if exists
                }
            );

            // If custom_data column doesn't exist, try without it
            if (result.error?.code === '42703' || result.error?.message?.includes('custom_data')) {
                console.log('custom_data column not found, upserting without it');
                result = await supabase.from('students').upsert(
                    insertData,
                    {
                        onConflict: 'professional_id,email',
                        ignoreDuplicates: false
                    }
                );
            }

            if (result.error) {
                console.error('Upsert error:', result.error);
                errors.push(`${student.name}: ${result.error.message}`);
                failed++;
            } else {
                success++;
            }
        }

        if (errors.length > 0 && errors.length <= 3) {
            setError(`Erros: ${errors.join('; ')}`);
        }

        setImportResult({ success, failed });
        setStep('result');
        setIsImporting(false);

        if (success > 0) {
            onSuccess();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <div className="flex items-center gap-3">
                        <FileSpreadsheet className="w-6 h-6 text-primary" />
                        <div>
                            <h2 className="text-lg font-bold">Importar Alunos</h2>
                            <p className="text-xs text-muted-foreground">
                                {step === 'upload' && 'Etapa 1/4: Selecione a planilha'}
                                {step === 'mapping' && 'Etapa 2/4: Mapeie as colunas'}
                                {step === 'preview' && 'Etapa 3/4: Revise os dados'}
                                {step === 'result' && 'Etapa 4/4: Resultado'}
                            </p>
                        </div>
                    </div>
                    <button onClick={handleClose} className="p-2 hover:bg-muted rounded-lg">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 overflow-y-auto max-h-[calc(90vh-140px)]">
                    {error && (
                        <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-lg flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <span className="text-sm">{error}</span>
                        </div>
                    )}

                    {/* STEP 1: Upload */}
                    {step === 'upload' && (
                        <div
                            className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                            onDrop={handleDrop}
                            onDragOver={(e) => e.preventDefault()}
                            onClick={() => document.getElementById('excel-file-input')?.click()}
                        >
                            <input
                                id="excel-file-input"
                                type="file"
                                accept=".xlsx,.xls,.csv"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            {isLoading ? (
                                <Loader2 className="w-12 h-12 mx-auto text-primary animate-spin mb-4" />
                            ) : (
                                <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                            )}
                            <h3 className="font-semibold text-lg mb-2">
                                {isLoading ? 'Processando...' : 'Arraste sua planilha aqui'}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                ou clique para selecionar
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Formatos aceitos: .xlsx, .xls, .csv
                            </p>
                        </div>
                    )}

                    {/* STEP 2: Column Mapping */}
                    {step === 'mapping' && (
                        <div className="space-y-4">
                            <div className="bg-primary/5 rounded-lg p-4 mb-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Link2 className="w-5 h-5 text-primary" />
                                    <h3 className="font-semibold">Mapeie as Colunas</h3>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Associe cada coluna da sua planilha ao campo correspondente do sistema.
                                    Você pode criar campos personalizados clicando em "+ Novo Campo".
                                </p>
                            </div>

                            {/* Custom fields indicator */}
                            {customFields.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                    <span className="text-xs text-muted-foreground">Campos personalizados:</span>
                                    {customFields.map(cf => (
                                        <span key={cf.key} className="px-2 py-0.5 bg-secondary/20 text-secondary rounded-full text-xs">
                                            {cf.label}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <div className="grid gap-3">
                                {mappings.map((mapping) => (
                                    <div key={mapping.excelColumn} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate">{mapping.excelColumn}</p>
                                            <p className="text-xs text-muted-foreground truncate">
                                                Ex: {String(rawData[0]?.[mapping.excelColumn] || '').substring(0, 25)}
                                            </p>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />

                                        {showNewFieldInput === mapping.excelColumn ? (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    value={newFieldName}
                                                    onChange={(e) => setNewFieldName(e.target.value)}
                                                    placeholder="Nome do campo"
                                                    className="w-36 px-2 py-1 border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                                    autoFocus
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') addCustomField(mapping.excelColumn, newFieldName);
                                                        if (e.key === 'Escape') setShowNewFieldInput(null);
                                                    }}
                                                />
                                                <button
                                                    onClick={() => addCustomField(mapping.excelColumn, newFieldName)}
                                                    className="px-2 py-1 bg-primary text-primary-foreground rounded text-xs"
                                                >
                                                    OK
                                                </button>
                                                <button
                                                    onClick={() => setShowNewFieldInput(null)}
                                                    className="px-2 py-1 text-muted-foreground hover:text-foreground text-xs"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <select
                                                    value={mapping.systemField}
                                                    onChange={(e) => updateMapping(mapping.excelColumn, e.target.value)}
                                                    className="w-44 px-3 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                                >
                                                    <option value="">-- Ignorar --</option>
                                                    <optgroup label="Campos do Sistema">
                                                        {SYSTEM_FIELDS.map(field => (
                                                            <option key={field.key} value={field.key}>
                                                                {field.label} {field.required ? '*' : ''}
                                                            </option>
                                                        ))}
                                                    </optgroup>
                                                    {customFields.length > 0 && (
                                                        <optgroup label="Campos Personalizados">
                                                            {customFields.map(cf => (
                                                                <option key={cf.key} value={`custom_${cf.key}`}>
                                                                    {cf.label}
                                                                </option>
                                                            ))}
                                                        </optgroup>
                                                    )}
                                                </select>
                                                <button
                                                    onClick={() => {
                                                        setShowNewFieldInput(mapping.excelColumn);
                                                        setNewFieldName('');
                                                    }}
                                                    className="p-2 hover:bg-muted rounded-lg text-primary"
                                                    title="Criar campo personalizado"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-between pt-4">
                                <button
                                    onClick={() => setStep('upload')}
                                    className="px-4 py-2 text-muted-foreground hover:text-foreground flex items-center gap-2"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Voltar
                                </button>
                                <button
                                    onClick={applyMapping}
                                    className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium flex items-center gap-2 hover:bg-primary/90"
                                >
                                    Continuar
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: Preview */}
                    {step === 'preview' && (
                        <div className="space-y-4">
                            <div className="bg-green-500/10 rounded-lg p-4 flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-green-500" />
                                <div>
                                    <p className="font-semibold text-green-700 dark:text-green-400">
                                        {parsedData.length} alunos prontos para importar
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {customFields.length > 0 && `${customFields.length} campo(s) personalizado(s) serão salvos`}
                                    </p>
                                </div>
                            </div>

                            <div className="border border-border rounded-lg overflow-hidden">
                                <div className="overflow-x-auto max-h-64">
                                    <table className="w-full text-sm">
                                        <thead className="bg-muted sticky top-0">
                                            <tr>
                                                <th className="px-3 py-2 text-left font-medium">#</th>
                                                <th className="px-3 py-2 text-left font-medium">Nome</th>
                                                <th className="px-3 py-2 text-left font-medium">Email</th>
                                                <th className="px-3 py-2 text-left font-medium">Telefone</th>
                                                {customFields.length > 0 && (
                                                    <th className="px-3 py-2 text-left font-medium">Campos Extras</th>
                                                )}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {parsedData.slice(0, 10).map((student, idx) => (
                                                <tr key={idx} className="border-t border-border">
                                                    <td className="px-3 py-2 text-muted-foreground">{idx + 1}</td>
                                                    <td className="px-3 py-2">{student.name}</td>
                                                    <td className="px-3 py-2">{student.email}</td>
                                                    <td className="px-3 py-2">{student.phone || '-'}</td>
                                                    {customFields.length > 0 && (
                                                        <td className="px-3 py-2 text-xs text-muted-foreground">
                                                            {Object.keys(student.custom_data || {}).length} campos
                                                        </td>
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                {parsedData.length > 10 && (
                                    <div className="p-2 bg-muted text-center text-xs text-muted-foreground">
                                        + {parsedData.length - 10} alunos não exibidos
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between pt-4">
                                <button
                                    onClick={() => setStep('mapping')}
                                    className="px-4 py-2 text-muted-foreground hover:text-foreground flex items-center gap-2"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Voltar
                                </button>
                                <button
                                    onClick={handleImport}
                                    disabled={isImporting}
                                    className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium flex items-center gap-2 hover:bg-primary/90 disabled:opacity-50"
                                >
                                    {isImporting ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Importando...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="w-4 h-4" />
                                            Importar {parsedData.length} Alunos
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 4: Result */}
                    {step === 'result' && importResult && (
                        <div className="text-center py-8">
                            {importResult.success > 0 ? (
                                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                            ) : (
                                <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
                            )}

                            <h3 className="text-xl font-bold mb-2">
                                {importResult.success > 0 ? 'Importação Concluída!' : 'Erro na Importação'}
                            </h3>

                            <div className="flex justify-center gap-6 my-6">
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-green-500">{importResult.success}</p>
                                    <p className="text-sm text-muted-foreground">Importados</p>
                                </div>
                                {importResult.failed > 0 && (
                                    <div className="text-center">
                                        <p className="text-3xl font-bold text-destructive">{importResult.failed}</p>
                                        <p className="text-sm text-muted-foreground">Falharam</p>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={handleClose}
                                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90"
                            >
                                Fechar
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
