import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";


import { Pharmacy, PharmacyFormData } from '.';
import PharmacyForm from './PharmacyForm';


// Omit ব্যবহার না করে সব properties include করুন
interface UpdatePharmacyDialogProps {
  isEditDialogOpen: boolean;
  setIsEditDialogOpen: (open: boolean) => void;
  formData: PharmacyFormData;
  handleSubmitEdit: (e: React.FormEvent) => void;
  setSelectedPharmacy: (pharmacy: Pharmacy | null) => void;
  resetFormData: () => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setFormData: React.Dispatch<React.SetStateAction<PharmacyFormData>>;
}

const UpdatePharmacyDialog = ({
  isEditDialogOpen,
  setIsEditDialogOpen,
  formData,
  handleSubmitEdit,
  setSelectedPharmacy,
  resetFormData,
  handleInputChange,
  handleFileChange,
  setFormData
}: UpdatePharmacyDialogProps) => (
  <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
    <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Edit Pharmacy</DialogTitle>
        <DialogDescription>
          Update the pharmacy details
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmitEdit} className="space-y-6 py-4">
        <PharmacyForm
          formData={formData}
          handleInputChange={handleInputChange}
          handleFileChange={handleFileChange}
          setFormData={setFormData}
        />

        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setIsEditDialogOpen(false);
              setSelectedPharmacy(null);
              resetFormData();
            }}
          >
            Cancel
          </Button>
          <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
            Update Pharmacy
          </Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
);

export default UpdatePharmacyDialog;