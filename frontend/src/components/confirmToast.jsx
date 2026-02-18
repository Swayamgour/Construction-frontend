import { toast } from "react-hot-toast";

export  const confirmToast = (message, onConfirm) => {
    toast(
        ({ closeToast }) => (
            <div>
                <p>{message}</p>
                <button
                    onClick={() => {
                        onConfirm();
                        closeToast();
                    }}
                    style={{ marginRight: "10px", background: "#4caf50", color: "#fff" }}
                >
                    Yes
                </button>
                <button
                    onClick={closeToast}
                    style={{ background: "#f44336", color: "#fff" }}
                >
                    No
                </button>
            </div>
        ),
        { autoClose: false }
    );
};
