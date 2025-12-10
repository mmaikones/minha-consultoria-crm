// Appointments/Schedule Data

export type AppointmentType = 'avaliacao' | 'checkin' | 'consulta' | 'treino' | 'retorno';

export interface Appointment {
    id: string;
    studentId: string;
    studentName: string;
    type: AppointmentType;
    date: string;
    time: string;
    duration: number; // minutes
    notes?: string;
    status: 'agendado' | 'confirmado' | 'concluido' | 'cancelado';
}

export const appointmentTypes = [
    { id: 'avaliacao', label: 'Avaliação Física', icon: '📊', color: 'bg-blue-500', duration: 60 },
    { id: 'checkin', label: 'Check-in Semanal', icon: '✅', color: 'bg-green-500', duration: 15 },
    { id: 'consulta', label: 'Consultoria', icon: '💬', color: 'bg-purple-500', duration: 45 },
    { id: 'treino', label: 'Treino Presencial', icon: '🏋️', color: 'bg-orange-500', duration: 60 },
    { id: 'retorno', label: 'Retorno', icon: '🔄', color: 'bg-teal-500', duration: 30 },
];

// Generate mock appointments for December 2024
export const mockAppointments: Appointment[] = [
    // Today
    { id: 'apt-1', studentId: '1', studentName: 'João Silva', type: 'checkin', date: '2024-12-08', time: '09:00', duration: 15, status: 'confirmado' },
    { id: 'apt-2', studentId: '2', studentName: 'Maria Santos', type: 'avaliacao', date: '2024-12-08', time: '10:00', duration: 60, status: 'agendado' },
    { id: 'apt-3', studentId: '3', studentName: 'Pedro Oliveira', type: 'treino', date: '2024-12-08', time: '14:00', duration: 60, status: 'confirmado' },

    // Tomorrow
    { id: 'apt-4', studentId: '4', studentName: 'Ana Costa', type: 'consulta', date: '2024-12-09', time: '09:30', duration: 45, status: 'agendado' },
    { id: 'apt-5', studentId: '5', studentName: 'Carlos Mendes', type: 'checkin', date: '2024-12-09', time: '11:00', duration: 15, status: 'agendado' },
    { id: 'apt-6', studentId: '1', studentName: 'João Silva', type: 'treino', date: '2024-12-09', time: '15:00', duration: 60, status: 'agendado' },

    // This week
    { id: 'apt-7', studentId: '6', studentName: 'Fernanda Lima', type: 'avaliacao', date: '2024-12-10', time: '10:00', duration: 60, status: 'agendado' },
    { id: 'apt-8', studentId: '7', studentName: 'Ricardo Souza', type: 'retorno', date: '2024-12-10', time: '14:00', duration: 30, status: 'agendado' },
    { id: 'apt-9', studentId: '2', studentName: 'Maria Santos', type: 'checkin', date: '2024-12-11', time: '09:00', duration: 15, status: 'agendado' },
    { id: 'apt-10', studentId: '3', studentName: 'Pedro Oliveira', type: 'consulta', date: '2024-12-11', time: '16:00', duration: 45, status: 'agendado' },

    // Next week
    { id: 'apt-11', studentId: '4', studentName: 'Ana Costa', type: 'avaliacao', date: '2024-12-15', time: '10:00', duration: 60, status: 'agendado' },
    { id: 'apt-12', studentId: '5', studentName: 'Carlos Mendes', type: 'treino', date: '2024-12-16', time: '08:00', duration: 60, status: 'agendado' },
    { id: 'apt-13', studentId: '6', studentName: 'Fernanda Lima', type: 'checkin', date: '2024-12-17', time: '11:00', duration: 15, status: 'agendado' },

    // Past (completed/cancelled)
    { id: 'apt-20', studentId: '1', studentName: 'João Silva', type: 'avaliacao', date: '2024-12-01', time: '10:00', duration: 60, status: 'concluido' },
    { id: 'apt-21', studentId: '2', studentName: 'Maria Santos', type: 'checkin', date: '2024-12-02', time: '09:00', duration: 15, status: 'concluido' },
    { id: 'apt-22', studentId: '3', studentName: 'Pedro Oliveira', type: 'consulta', date: '2024-12-03', time: '14:00', duration: 45, status: 'cancelado' },
];

export const getAppointmentsByDate = (appointments: Appointment[], date: string) => {
    return appointments.filter(a => a.date === date);
};

export const getAppointmentTypeInfo = (typeId: string) => {
    return appointmentTypes.find(t => t.id === typeId) || appointmentTypes[0];
};

export const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '14:00', '14:30', '15:00',
    '15:30', '16:00', '16:30', '17:00', '17:30', '18:00'
];
