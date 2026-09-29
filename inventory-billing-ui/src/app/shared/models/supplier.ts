
export interface Supplier {
    id: number;
    code: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    taxNumber: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}