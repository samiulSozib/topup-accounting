import Swal from "sweetalert2";

export const successAlert = (message: string) => {
  Swal.fire({
    icon: "success",
    title: "Success",
    text: message,
    timer: 2000,
    showConfirmButton: false,
  });
};

export const errorAlert = (message: string) => {
  Swal.fire({
    icon: "error",
    title: "Error",
    text: message,
  });
};

export const confirmDelete = async (): Promise<boolean> => {
  const result = await Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#ef4444",
    cancelButtonText: "Cancel",
    confirmButtonText: "Delete",
  });

  return result.isConfirmed;
};