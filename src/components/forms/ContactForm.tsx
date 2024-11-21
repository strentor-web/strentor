"use client"

import React, { useState, useEffect} from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import countriesData from "@/utils/countries.json"
import 'react-datepicker/dist/react-datepicker.css';
import { Search } from 'lucide-react';

type FormData = {
  name: string;
  surname: string;
  email: string;
  country: string;
  dialCode: string;
  contactNumber: string;
  appointmentDate: Date | null;
  appointmentTime: string;
  servicesInterested: string[];
}

interface ContactFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const serviceOptions = ['Fitness', 'Psychological', 'Life Coaching', 'Manifestation'];

const initialFormData: FormData = {
  name: '',
  surname: '',
  email: '',
  country: '',
  dialCode: '',
  contactNumber: '',
  appointmentDate: null,
  appointmentTime: '',
  servicesInterested: []
};

export const ContactForm: React.FC<ContactFormProps> = ({ open, onOpenChange }) => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  // const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCountries, setFilteredCountries] = useState(countriesData);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // const handleDateChange = (date: Date | null) => {
  //   setSelectedDate(date);
  //   setFormData({ ...formData, appointmentDate: date, appointmentTime: '' });
  // };

 

  const handleSelectChange = (name: string, value: string) => {
    if (name === 'country') {
      // Find the corresponding country object when a country is selected
      const selectedCountry = countriesData.find(country => country.name === value);
      if (selectedCountry) {
        setFormData(prev => ({
          ...prev,
          country: selectedCountry.name, // Use country name
          dialCode: selectedCountry.dial_code
        }));
      }
    } else if (name === 'dialCode') {
      // If dial code is changed manually, just update the dial code
      setFormData(prev => ({
        ...prev,
        dialCode: value
      }));
    } else {
      // Handle other select changes normally
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  useEffect(() => {
    const filtered = countriesData.filter(country =>
      country.name.toLowerCase().startsWith(searchQuery.toLowerCase())
    );
    setFilteredCountries(filtered);
  }, [searchQuery]);

  // Add keyboard event handler for country select
  const handleCountryKeyDown = (e:React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^[a-zA-Z\s]*$/.test(value)) {
      setSearchQuery(value);
    }
  };

  const handleCountrySearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const key = e.key;
    // Prevent numeric keys and any other unwanted keys
    if (!isNaN(Number(key))) {
      e.preventDefault();
    }
  };
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit form');
      }

      const result = await response.json();
      console.log('Form submitted successfully:', result);
      clearForm();
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const clearForm = () => {
    setFormData(initialFormData);

  };

  // const getAvailableTimeSlots = () => {
  //   if (!selectedDate) return [];
  //   const day = selectedDate.getDay();
  //   const isWeekend = day === 0;
  //   return isWeekend
  //     ? ['1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM']
  //     : ['1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'];
  // };

  const handleCheckboxChange = (service: string) => {
    setFormData((prev) => {
      const updatedServices = prev.servicesInterested.includes(service)
        ? prev.servicesInterested.filter((s) => s !== service)
        : [...prev.servicesInterested, service];
      return { ...prev, servicesInterested: updatedServices };
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Form Details</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center gap-4">
            <Label htmlFor="name" className="w-1/3">Name</Label>
            <Input id="name" name="name" required value={formData.name} onChange={handleInputChange} />
          </div>

          <div className="flex items-center gap-4">
            <Label htmlFor="surname" className="w-1/3">Surname</Label>
            <Input id="surname" name="surname" required value={formData.surname} onChange={handleInputChange} />
          </div>

          <div className="flex items-center gap-4">
            <Label htmlFor="email" className="w-1/3">Email</Label>
            <Input id="email" name="email" type="email" required value={formData.email} onChange={handleInputChange} />
          </div>

          <div className="flex items-center gap-4">
            <Label htmlFor="country" className="w-1/3">Country</Label>
            <Select 
              name="country" 
              value={formData.country} 
              onValueChange={(value) => handleSelectChange('country', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a country" />
              </SelectTrigger>
              <SelectContent 
                onChange={handleCountryKeyDown}
                className="max-h-[300px]"
              >
                <div className="sticky top-0 bg-white p-2 border-b">
                  <div className="flex items-center px-2 py-1 border rounded-md">
                    <Search className="w-4 h-4 mr-2 text-gray-400" />
                    <input
                      className="w-full border-none outline-none bg-transparent placeholder:text-gray-400"
                      placeholder="Search countries..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={handleCountrySearchKeyDown}
                    />
                  </div>
                </div>
                <div className="pt-2">
                  {filteredCountries.length > 0 ? ( filteredCountries.map((country) => (
                    <SelectItem key={country.code} value={country.name}>
                      {country.emoji} {country.name}
                    </SelectItem>
                  ))):
                  (
                    <p className="text-sm text-gray-500 p-2">No countries found</p>

                  )}
                </div>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-4">
            <Label htmlFor="contactNumber" className="w-1/3">Mobile No.</Label>
            <div className="flex space-x-2">
              <Select name="dialCode" value={formData.dialCode} onValueChange={(value) => handleSelectChange('dialCode', value)}>
                <SelectTrigger className="w-24">
                  <SelectValue placeholder="Code" />
                </SelectTrigger>
                <SelectContent>
                  {countriesData.map((country) => (
                    <SelectItem key={country.code} value={country.dial_code}>
                      {country.emoji} {country.dial_code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                id="contactNumber"
                name="contactNumber"
                type="tel"
                required
                value={formData.contactNumber}
                onChange={handleInputChange}
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <Label className="block font-medium text-gray-700">Services Interested (Select Multiple)</Label>
            <div className="flex flex-col gap-2 mt-2">
              {serviceOptions.map((service) => (
                <label key={service} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    value={service}
                    checked={formData.servicesInterested.includes(service)}
                    onChange={() => handleCheckboxChange(service)}
                  />
                  <span>{service}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={clearForm}>
              Clear Fields
            </Button>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Submit</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};