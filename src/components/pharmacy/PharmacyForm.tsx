import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PharmacyFormProps } from '.';


const PharmacyForm = ({ formData, handleInputChange, handleFileChange }: PharmacyFormProps) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="space-y-2">
      <Label htmlFor="name">Pharmacy Name *</Label>
      <Input
        id="name"
        name="name"
        value={formData.name}
        onChange={handleInputChange}
        placeholder="Enter pharmacy name"
        required
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="address">Address *</Label>
      <Input
        id="address"
        name="address"
        value={formData.address}
        onChange={handleInputChange}
        placeholder="Enter address"
        required
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="phone">Phone *</Label>
      <Input
        id="phone"
        name="phone"
        value={formData.phone}
        onChange={handleInputChange}
        placeholder="Enter phone number"
        required
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="email">Email *</Label>
      <Input
        id="email"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleInputChange}
        placeholder="Enter email"
        required
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="contactPerson">Contact Person *</Label>
      <Input
        id="contactPerson"
        name="contactPerson"
        value={formData.contactPerson}
        onChange={handleInputChange}
        placeholder="Enter contact person name"
        required
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="title">Title *</Label>
      <Input
        id="title"
        name="title"
        value={formData.title}
        onChange={handleInputChange}
        placeholder="Enter title"
        required
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="yearofBusiness">Year of Business *</Label>
      <Input
        id="yearofBusiness"
        name="yearofBusiness"
        value={formData.yearofBusiness}
        onChange={handleInputChange}
        placeholder="Enter year"
        required
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="businessPhoneNumber">Business Number *</Label>
      <Input
        id="businessPhoneNumber"
        name="businessPhoneNumber"
        type="number"
        step="any"
        value={formData.businessPhoneNumber}
        onChange={handleInputChange}
        placeholder="Enter Business Number"
        required
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="latitude">Latitude *</Label>
      <Input
        id="latitude"
        name="latitude"
        type="number"
        step="any"
        value={formData.latitude}
        onChange={handleInputChange}
        placeholder="Enter latitude"
        required
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="longitude">Longitude *</Label>
      <Input
        id="longitude"
        name="longitude"
        type="number"
        step="any"
        value={formData.longitude}
        onChange={handleInputChange}
        placeholder="Enter longitude"
        required
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="logo">Logo</Label>
      <Input
        id="logo"
        name="logo"
        type="file"
        accept="image/*"
        onChange={handleFileChange}
      />
    </div>

    <div className="space-y-2">
      <Label htmlFor="licenseNumber">Licence Number *</Label>
      <Input
        id="licenseNumber"
        name="licenseNumber"
        type="text"
        step="any"
        value={formData.licenseNumber}
        onChange={handleInputChange}
        placeholder="Enter License Number"
        required
      />
    </div>

    <div className="space-y-2 md:col-span-2">
      <Label htmlFor="message">Message</Label>
      <Textarea
        id="message"
        name="message"
        value={formData.message}
        onChange={handleInputChange}
        placeholder="Enter message"
        rows={3}
      />
    </div>


  </div>
);

export default PharmacyForm;