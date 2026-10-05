export interface Category {
    id: number;
    name: string;
    description: string;
    isActive: boolean;
    productCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface CategoryInput {
    name: string;
    description: string;
    isActive: boolean;
}

export interface CreateCategoryRequest
    extends CategoryInput { }

export interface UpdateCategoryRequest
    extends CategoryInput { }