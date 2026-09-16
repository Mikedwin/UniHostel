import Swal from "sweetalert2";

export const showSuccess = (title, text = "") => {
  return Swal.fire({
    title,
    text,
    icon: "success",
    confirmButtonText: "OK",
    confirmButtonColor: "#173b35",
  });
};

export const showError = (title, text = "") => {
  return Swal.fire({
    title,
    text,
    icon: "error",
    confirmButtonText: "Close",
    confirmButtonColor: "#ef4444",
  });
};

export const showWarning = (title, text = "") => {
  return Swal.fire({
    title,
    text,
    icon: "warning",
    confirmButtonText: "Got it",
    confirmButtonColor: "#c96e32",
  });
};

export const showInfo = (title, text = "") => {
  return Swal.fire({
    title,
    text,
    icon: "info",
    confirmButtonText: "OK",
    confirmButtonColor: "#173b35",
  });
};

export const showConfirm = async ({
  title,
  text = "",
  confirmText = "Yes, proceed",
  cancelText = "Cancel",
  isDanger = false,
  icon = "question",
}) => {
  const result = await Swal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    confirmButtonColor: isDanger ? "#ef4444" : "#173b35",
    cancelButtonColor: "#64746e",
    customClass: isDanger ? { confirmButton: "swal2-danger" } : undefined,
  });
  return result.isConfirmed;
};

export const showPrompt = async ({
  title,
  text = "",
  inputPlaceholder = "Enter text...",
  confirmText = "Submit",
  cancelText = "Cancel",
  inputValidator,
  inputType = "text",
}) => {
  const result = await Swal.fire({
    title,
    text,
    input: inputType,
    inputPlaceholder,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    confirmButtonColor: "#173b35",
    cancelButtonColor: "#64746e",
    inputValidator:
      inputValidator ||
      ((value) => {
        if (!value || !value.trim()) {
          return "This field cannot be empty";
        }
      }),
  });
  return result.isConfirmed ? result.value : null;
};

export default {
  showSuccess,
  showError,
  showWarning,
  showInfo,
  showConfirm,
  showPrompt,
};
