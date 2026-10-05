import { useUserDetailQuery, useCheckLoginQuery } from "../Reduxe/Api";

export const CheckRole = () => {
    const { data: userDetail, isLoading: loading1, isError: err1 } = useUserDetailQuery();
    const { data: checkLogin } = useCheckLoginQuery();

    const user = userDetail?.user || checkLogin?.user;
    const rawRole = user?.role || "";
    const role = String(rawRole).toLowerCase();

    return {
        role,
        user,
        isLoading: loading1 && !user,
        isError: err1
    };
};

export default CheckRole;
