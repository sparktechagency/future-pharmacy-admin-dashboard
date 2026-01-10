import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Pharmacy } from '.';


interface DeletePharmacyDialogProps {
  isDeleteDialogOpen: boolean;
  setIsDeleteDialogOpen: (open: boolean) => void;
  pharmacyToDelete: Pharmacy | null;
  setPharmacyToDelete: (pharmacy: Pharmacy | null) => void;
  confirmDelete: () => void;
}

const DeletePharmacyDialog = ({
  isDeleteDialogOpen,
  setIsDeleteDialogOpen,
  pharmacyToDelete,
  setPharmacyToDelete,
  confirmDelete
}: DeletePharmacyDialogProps) => (
  <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
        <AlertDialogDescription>
          This action cannot be undone. This will permanently delete the pharmacy
          <span className="font-semibold"> &quot;{pharmacyToDelete?.name}&quot;</span> from the system.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel onClick={() => setPharmacyToDelete(null)}>
          Cancel
        </AlertDialogCancel>
        <AlertDialogAction
          onClick={confirmDelete}
          className="bg-red-600 hover:bg-red-700"
        >
          Delete
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

export default DeletePharmacyDialog;