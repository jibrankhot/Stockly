export interface Supplier {
    id: number;
    code: string;
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    postalCode: string | null;
    taxNumber: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}