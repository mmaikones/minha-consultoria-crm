export interface Assessment {
    id: string;
    date: string;
    weight: number;
    bodyFat: number;
    chest: number;
    waist: number;
    arms: number;
    legs: number;
    photoUrl?: string;
}

export const mockAssessments: Assessment[] = [
    {
        id: 'a1',
        date: '2024-06-01',
        weight: 85,
        bodyFat: 22,
        chest: 102,
        waist: 92,
        arms: 35,
        legs: 58,
        photoUrl: 'before',
    },
    {
        id: 'a2',
        date: '2024-08-01',
        weight: 82,
        bodyFat: 19,
        chest: 104,
        waist: 88,
        arms: 36,
        legs: 59,
    },
    {
        id: 'a3',
        date: '2024-10-01',
        weight: 80,
        bodyFat: 17,
        chest: 105,
        waist: 84,
        arms: 37,
        legs: 60,
    },
    {
        id: 'a4',
        date: '2024-12-01',
        weight: 78,
        bodyFat: 15,
        chest: 106,
        waist: 80,
        arms: 38,
        legs: 61,
        photoUrl: 'after',
    },
];
