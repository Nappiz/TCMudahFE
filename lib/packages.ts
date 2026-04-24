import { api, postJSON, patchJSON, deleteJSON } from "./api";

export interface PackageItem {
    id: string;
    title: string;
    description: string;
    price: number;
    class_ids: string[];
    visible: boolean;
    created_at?: string;
}

export async function fetchPackages(): Promise<PackageItem[]> {
    return api<PackageItem[]>("/packages");
}

export async function createPackageItem(payload: Partial<PackageItem>): Promise<PackageItem> {
    return postJSON("/admin/packages", payload);
}

export async function updatePackageItem(id: string, payload: Partial<PackageItem>): Promise<PackageItem> {
    return patchJSON(`/admin/packages/${id}`, payload);
}

export async function deletePackageItem(id: string): Promise<void> {
    return deleteJSON(`/admin/packages/${id}`);
}

export async function patchPackageVisibility(id: string, visible: boolean): Promise<PackageItem> {
    return patchJSON(`/admin/packages/${id}`, { visible });
}