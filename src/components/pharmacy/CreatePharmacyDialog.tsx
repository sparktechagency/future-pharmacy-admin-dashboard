import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

import { PharmacyFormData } from '.';
import PharmacyForm from './PharmacyForm';

interface CreatePharmacyDialogProps {
  isAddDialogOpen: boolean;
  setIsAddDialogOpen: (open: boolean) => void;
  formData: PharmacyFormData;
  handleSubmitAdd: (e: React.FormEvent) => void;
  resetFormData: () => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setFormData: React.Dispatch<React.SetStateAction<PharmacyFormData>>;
}

const CreatePharmacyDialog = ({
  isAddDialogOpen,
  setIsAddDialogOpen,
  formData,
  handleSubmitAdd,
  resetFormData,
  handleInputChange,
  handleFileChange,
  setFormData
}: CreatePharmacyDialogProps) => (
  <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
    <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Add Partner Pharmacy</DialogTitle>
        <DialogDescription>
          Fill in the details to add a new partner pharmacy
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmitAdd} className="space-y-6 py-4">
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
              setIsAddDialogOpen(false);
              resetFormData();
            }}
          >
            Cancel
          </Button>
          <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
            Add Pharmacy
          </Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
);

export default CreatePharmacyDialog;