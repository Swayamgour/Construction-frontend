import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Slide from "@mui/material/Slide";

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

/**
 * Props:
 * - isOpen: boolean -> controls dialog visibility
 * - onClose: function -> called when dialog closes
 * - title: string -> dialog title
 * - content: string | ReactNode -> content inside dialog
 * - actions: array of { label: string, onClick?: function, color?: 'primary' | 'secondary' }
 */
export default function DialogBox({
    isOpen,
    onClose,
    title,
    children,
    actions = [],
}) {

   
    return (
        <Dialog
            open={isOpen}
            slots={{ transition: Transition }}
            keepMounted
            onClose={onClose}
            aria-labelledby="dialog-title"
            aria-describedby="dialog-description"
        >
            {/* <DialogTitle id="dialog-title">{title || "jhg"}</DialogTitle> */}


            <DialogContent dividers>
                {children}
            </DialogContent>

            <DialogActions>
                {actions.length > 0
                    ? actions.map((action, idx) => (
                        <Button
                            key={idx}
                            onClick={() => {
                                action.onClick?.();
                                onClose?.();
                            }}
                            color={action.color || "primary"}
                        >
                            {action.label}
                        </Button>
                    ))
                    : (
                        <>
                        </>
                    )}
            </DialogActions>
        </Dialog>
    );
}
