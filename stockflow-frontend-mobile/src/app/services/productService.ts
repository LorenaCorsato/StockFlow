import axios from "axios";
import { Product } from "../models/product";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8080";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export async function getProducts(): Promise<Product[]> {
  const response = await api.get<Product[]>("/api/products");
  return response.data;
}

export async function getProductById(id: number): Promise<Product> {
  const response = await api.get<Product>(`/api/products/${id}`);
  return response.data;
}
