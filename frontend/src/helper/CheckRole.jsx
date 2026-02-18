import { useUserDetailQuery } from "../Reduxe/Api";

export const CheckRole = () => {
    
    const { data, isLoading, isError } = useUserDetailQuery();

    return {
        role: data?.user?.role,
        user: data?.user,
        isLoading,
        isError
    };
};
