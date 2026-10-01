import { useUserDetailQuery } from "../Reduxe/Api";

export const CheckRole = () => {

    const { data, isLoading, isError } = useUserDetailQuery();

    console.log("data", data);

    return {
        role: data?.user?.role,
        user: data?.user,
        isLoading,
        isError
    };
};

export default CheckRole;
