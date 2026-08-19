import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { createProduct, getAllProducts } from "../lib/api"

export const useProducts = () => {
    return useQuery({ queryKey: ["products"], queryFn: getAllProducts });
     
}

export const useCreateProduct = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createProduct,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
    });
}