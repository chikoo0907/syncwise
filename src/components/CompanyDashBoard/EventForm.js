import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';

export default function EventForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  // Form validation schema
  const validationSchema = Yup.object().shape({
    title: Yup.string().required('Event title is required'),
    type: Yup.string().required('Event type is required'),
    description: Yup.string().required('Description is required').max(500, 'Description too long'),
    date: Yup.date().required('Date is required').min(new Date(), 'Date must be in the future'),
    time: Yup.string().required('Time is required'),
    mode: Yup.string().required('Mode is required'),
    location: Yup.string().when('mode', {
      is: 'Offline',
      then: Yup.string().required('Location is required for offline events')
    }),
    contactEmail: Yup.string().email('Invalid email').required('Contact email is required'),
    contactPhone: Yup.string().matches(/^[0-9]{10}$/, 'Phone number must be 10 digits'),
    registrationLink: Yup.string().url('Invalid URL'),
    banner: Yup.mixed()
      .test('fileSize', 'File too large', value => !value || (value && value.size <= 5 * 1024 * 1024))
      .test('fileType', 'Unsupported file type', value => !value || (value && ['image/jpeg', 'image/png'].includes(value.type))),
    duration: Yup.string().matches(/^\d+\s*(hours?|mins?|days?)$/i, 'Format: "2 hours" or "30 min"'),
    fees: Yup.string().matches(/^\$?\d+(\.\d{1,2})?$/, 'Invalid amount format')
  });

  const formik = useFormik({
    initialValues: {
      title: '',
      type: '',
      description: '',
      date: '',
      time: '',
      mode: '',
      location: '',
      contactEmail: '',
      contactPhone: '',
      registrationLink: '',
      banner: null,
      duration: '',
      fees: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        formik.resetForm();
        setPreviewImage(null);
        formik.setStatus({ success: 'Event submitted successfully!' });
      } catch (error) {
        formik.setStatus({ error: 'Submission failed. Please try again.' });
      } finally {
        setIsSubmitting(false);
      }
    }
  });

  const handleImageChange = (e) => {
    const file = e.currentTarget.files[0];
    formik.setFieldValue('banner', file);
    
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewImage(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md overflow-hidden p-0">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
        <h1 className="text-2xl font-bold">Create New Event</h1>
        <p className="opacity-90">Fill out the form below to list your event</p>
      </div>

      <div className="p-6 md:p-8">
        {formik.status?.error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            {formik.status.error}
          </div>
        )}

        {formik.status?.success && (
          <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg border border-green-200">
            {formik.status.success}
          </div>
        )}

        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="col-span-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Event Title <span className="text-red-500">*</span>
              </label>
              <input
                id="title"
                name="title"
                type="text"
                className={`w-full px-4 py-2 rounded-lg border ${formik.errors.title && formik.touched.title ? 'border-red-300' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                placeholder="e.g. AI Conference 2023"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.title}
              />
              {formik.errors.title && formik.touched.title && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.title}</p>
              )}
            </div>

            {/* Event Type */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                Event Type <span className="text-red-500">*</span>
              </label>
              <select
                id="type"
                name="type"
                className={`w-full px-4 py-2 rounded-lg border ${formik.errors.type && formik.touched.type ? 'border-red-300' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.type}
              >
                <option value="">Select event type</option>
                <option value="Conference">Conference</option>
                <option value="Webinar">Webinar</option>
                <option value="Workshop">Workshop</option>
                <option value="Seminar">Seminar</option>
                <option value="Hackathon">Hackathon</option>
                <option value="Networking">Networking</option>
              </select>
              {formik.errors.type && formik.touched.type && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.type}</p>
              )}
            </div>

            {/* Duration */}
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                Duration
              </label>
              <input
                id="duration"
                name="duration"
                type="text"
                className={`w-full px-4 py-2 rounded-lg border ${formik.errors.duration && formik.touched.duration ? 'border-red-300' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                placeholder="e.g. 2 hours or 30 min"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.duration}
              />
              {formik.errors.duration && formik.touched.duration && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.duration}</p>
              )}
            </div>

            {/* Date and Time */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                id="date"
                name="date"
                type="date"
                min={new Date().toISOString().split('T')[0]}
                className={`w-full px-4 py-2 rounded-lg border ${formik.errors.date && formik.touched.date ? 'border-red-300' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.date}
              />
              {formik.errors.date && formik.touched.date && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.date}</p>
              )}
            </div>

            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                Time <span className="text-red-500">*</span>
              </label>
              <input
                id="time"
                name="time"
                type="time"
                className={`w-full px-4 py-2 rounded-lg border ${formik.errors.time && formik.touched.time ? 'border-red-300' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.time}
              />
              {formik.errors.time && formik.touched.time && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.time}</p>
              )}
            </div>

            {/* Mode and Location */}
            <div>
              <label htmlFor="mode" className="block text-sm font-medium text-gray-700 mb-1">
                Mode <span className="text-red-500">*</span>
              </label>
              <select
                id="mode"
                name="mode"
                className={`w-full px-4 py-2 rounded-lg border ${formik.errors.mode && formik.touched.mode ? 'border-red-300' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.mode}
              >
                <option value="">Select event mode</option>
                <option value="Online">Online</option>
                <option value="Offline">Offline</option>
                <option value="Hybrid">Hybrid</option>
              </select>
              {formik.errors.mode && formik.touched.mode && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.mode}</p>
              )}
            </div>

            {formik.values.mode !== 'Online' && (
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Location {formik.values.mode !== 'Online' && <span className="text-red-500">*</span>}
                </label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  className={`w-full px-4 py-2 rounded-lg border ${formik.errors.location && formik.touched.location ? 'border-red-300' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="Venue or address"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.location}
                />
                {formik.errors.location && formik.touched.location && (
                  <p className="mt-1 text-sm text-red-600">{formik.errors.location}</p>
                )}
              </div>
            )}

            {/* Fees */}
            <div>
              <label htmlFor="fees" className="block text-sm font-medium text-gray-700 mb-1">
                Fees
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">$</span>
                </div>
                <input
                  id="fees"
                  name="fees"
                  type="text"
                  className={`pl-8 w-full px-4 py-2 rounded-lg border ${formik.errors.fees && formik.touched.fees ? 'border-red-300' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="0.00"
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  value={formik.values.fees}
                />
              </div>
              {formik.errors.fees && formik.touched.fees && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.fees}</p>
              )}
            </div>

            {/* Contact Info */}
            <div>
              <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">
                Contact Email <span className="text-red-500">*</span>
              </label>
              <input
                id="contactEmail"
                name="contactEmail"
                type="email"
                className={`w-full px-4 py-2 rounded-lg border ${formik.errors.contactEmail && formik.touched.contactEmail ? 'border-red-300' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                placeholder="contact@example.com"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.contactEmail}
              />
              {formik.errors.contactEmail && formik.touched.contactEmail && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.contactEmail}</p>
              )}
            </div>

            <div>
              <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-1">
                Contact Phone
              </label>
              <input
                id="contactPhone"
                name="contactPhone"
                type="tel"
                className={`w-full px-4 py-2 rounded-lg border ${formik.errors.contactPhone && formik.touched.contactPhone ? 'border-red-300' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                placeholder="1234567890"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.contactPhone}
              />
              {formik.errors.contactPhone && formik.touched.contactPhone && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.contactPhone}</p>
              )}
            </div>

            {/* Registration Link */}
            <div className="col-span-2">
              <label htmlFor="registrationLink" className="block text-sm font-medium text-gray-700 mb-1">
                Registration Link
              </label>
              <input
                id="registrationLink"
                name="registrationLink"
                type="url"
                className={`w-full px-4 py-2 rounded-lg border ${formik.errors.registrationLink && formik.touched.registrationLink ? 'border-red-300' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                placeholder="https://example.com/register"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.registrationLink}
              />
              {formik.errors.registrationLink && formik.touched.registrationLink && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.registrationLink}</p>
              )}
            </div>

            {/* Description */}
            <div className="col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                className={`w-full px-4 py-2 rounded-lg border ${formik.errors.description && formik.touched.description ? 'border-red-300' : 'border-gray-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                placeholder="Detailed description of your event..."
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.description}
              />
              <div className="flex justify-between items-center mt-1">
                {formik.errors.description && formik.touched.description ? (
                  <p className="text-sm text-red-600">{formik.errors.description}</p>
                ) : (
                  <p className="text-sm text-gray-500">Max 500 characters</p>
                )}
                <span className="text-sm text-gray-500">{formik.values.description.length}/500</span>
              </div>
            </div>

            {/* Banner Upload */}
            <div className="col-span-2">
              <label htmlFor="banner" className="block text-sm font-medium text-gray-700 mb-1">
                Event Banner/Poster
              </label>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <input
                    id="banner"
                    name="banner"
                    type="file"
                    accept="image/*"
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-lg file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100"
                    onChange={handleImageChange}
                    onBlur={formik.handleBlur}
                  />
                  {formik.errors.banner && formik.touched.banner && (
                    <p className="mt-1 text-sm text-red-600">{formik.errors.banner}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">JPEG or PNG, max 5MB</p>
                </div>
                {previewImage && (
                  <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200">
                    <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-medium rounded-lg shadow-md hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                'Submit Event'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}