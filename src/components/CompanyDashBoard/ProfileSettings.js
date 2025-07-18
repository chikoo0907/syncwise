import React, { useState, useRef } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Globe, 
  Camera, 
  Upload, 
  Save, 
  Check, 
  X, 
  Eye, 
  Edit3, 
  Building, 
  MapPin, 
  Calendar,
  Instagram,
  Twitter,
  Facebook,
  Linkedin,
  Youtube,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

export default function ProfileSettings() {
  const [profile, setProfile] = useState({
    name: 'Tech University',
    email: 'contact@techuniversity.edu',
    phone: '+1 (555) 123-4567',
    about: 'Leading technology institute focused on innovation and excellence in education.',
    logo: null,
    website: 'https://techuniversity.edu',
    address: '123 Education Street, Tech City, TC 12345',
    founded: '1985',
    socials: {
      instagram: 'https://instagram.com/techuniversity',
      twitter: 'https://twitter.com/techuniversity',
      facebook: 'https://facebook.com/techuniversity',
      linkedin: 'https://linkedin.com/company/techuniversity',
      youtube: 'https://youtube.com/techuniversity'
    }
  });
  
  const [success, setSuccess] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setSaveLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);
  const fileInputRef = useRef(null);

  const validateForm = () => {
    const newErrors = {};
    
    if (!profile.name.trim()) newErrors.name = 'Institute name is required';
    if (!profile.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(profile.email)) newErrors.email = 'Email is invalid';
    
    if (profile.phone && !/^\+?[\d\s\-\(\)]+$/.test(profile.phone)) {
      newErrors.phone = 'Phone number format is invalid';
    }
    
    if (profile.website && !/^https?:\/\/.+/.test(profile.website)) {
      newErrors.website = 'Website must be a valid URL (include https://)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'logo') {
      const file = files[0];
      if (file) {
        setProfile({ ...profile, logo: file });
        
        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => setLogoPreview(e.target.result);
        reader.readAsDataURL(file);
      }
    } else if (name.startsWith('socials.')) {
      const socialKey = name.split('.')[1];
      setProfile({
        ...profile,
        socials: { ...profile.socials, [socialKey]: value }
      });
    } else {
      setProfile({ ...profile, [name]: value });
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSaveLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setSuccess('Profile updated successfully!');
      setSaveLoading(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    }, 1000);
  };

  const handleLogoClick = () => {
    fileInputRef.current?.click();
  };

  const removeLogo = () => {
    setProfile({ ...profile, logo: null });
    setLogoPreview(null);
  };

  const getSocialIcon = (platform) => {
    switch(platform) {
      case 'instagram': return <Instagram className="w-5 h-5" />;
      case 'twitter': return <Twitter className="w-5 h-5" />;
      case 'facebook': return <Facebook className="w-5 h-5" />;
      case 'linkedin': return <Linkedin className="w-5 h-5" />;
      case 'youtube': return <Youtube className="w-5 h-5" />;
      default: return <Globe className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Profile Settings
          </h1>
          <p className="text-slate-600 text-lg">Manage your institute's profile and branding</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-800 font-medium">{success}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Preview Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sticky top-6">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Profile Preview</h3>
                <button
                  onClick={() => setPreviewMode(!previewMode)}
                  className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center space-x-1 mx-auto"
                >
                  <Eye className="w-4 h-4" />
                  <span>{previewMode ? 'Edit Mode' : 'Preview Mode'}</span>
                </button>
              </div>

              {/* Logo Preview */}
              <div className="relative mb-6">
                <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center overflow-hidden">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo preview" className="w-full h-full object-cover" />
                  ) : (
                    <Building className="w-16 h-16 text-white" />
                  )}
                </div>
                <button
                  onClick={handleLogoClick}
                  className="absolute bottom-0 right-1/2 transform translate-x-1/2 translate-y-1/2 p-2 bg-white rounded-full shadow-lg border border-slate-200 hover:shadow-xl transition-shadow"
                >
                  <Camera className="w-4 h-4 text-slate-600" />
                </button>
              </div>

              {/* Profile Info */}
              <div className="space-y-4">
                <div className="text-center">
                  <h4 className="text-xl font-bold text-slate-800">{profile.name || 'Institute Name'}</h4>
                  <p className="text-slate-600">{profile.email}</p>
                </div>

                <div className="space-y-2">
                  {profile.phone && (
                    <div className="flex items-center space-x-2 text-sm text-slate-600">
                      <Phone className="w-4 h-4" />
                      <span>{profile.phone}</span>
                    </div>
                  )}
                  {profile.website && (
                    <div className="flex items-center space-x-2 text-sm text-slate-600">
                      <Globe className="w-4 h-4" />
                      <span className="truncate">{profile.website}</span>
                    </div>
                  )}
                  {profile.address && (
                    <div className="flex items-center space-x-2 text-sm text-slate-600">
                      <MapPin className="w-4 h-4" />
                      <span>{profile.address}</span>
                    </div>
                  )}
                  {profile.founded && (
                    <div className="flex items-center space-x-2 text-sm text-slate-600">
                      <Calendar className="w-4 h-4" />
                      <span>Founded in {profile.founded}</span>
                    </div>
                  )}
                </div>

                {profile.about && (
                  <div className="pt-4 border-t border-slate-200">
                    <p className="text-sm text-slate-600 leading-relaxed">{profile.about}</p>
                  </div>
                )}

                {/* Social Links */}
                <div className="pt-4 border-t border-slate-200">
                  <div className="flex justify-center space-x-3">
                    {Object.entries(profile.socials).map(([platform, url]) => (
                      url && (
                        <a
                          key={platform}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"
                        >
                          {getSocialIcon(platform)}
                        </a>
                      )
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                <h3 className="text-xl font-semibold text-slate-800 mb-6 flex items-center space-x-2">
                  <User className="w-5 h-5" />
                  <span>Basic Information</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Institute Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={profile.name}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                        errors.name ? 'border-red-300 bg-red-50' : 'border-slate-300 focus:border-indigo-300'
                      }`}
                      placeholder="Enter institute name"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.name}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Contact Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={profile.email}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                        errors.email ? 'border-red-300 bg-red-50' : 'border-slate-300 focus:border-indigo-300'
                      }`}
                      placeholder="Enter email address"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.email}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Contact Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={profile.phone}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                        errors.phone ? 'border-red-300 bg-red-50' : 'border-slate-300 focus:border-indigo-300'
                      }`}
                      placeholder="Enter phone number"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.phone}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      name="website"
                      value={profile.website}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                        errors.website ? 'border-red-300 bg-red-50' : 'border-slate-300 focus:border-indigo-300'
                      }`}
                      placeholder="https://example.com"
                    />
                    {errors.website && (
                      <p className="mt-1 text-sm text-red-600 flex items-center space-x-1">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.website}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={profile.address}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-300 transition-colors"
                      placeholder="Enter address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Founded Year
                    </label>
                    <input
                      type="text"
                      name="founded"
                      value={profile.founded}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-300 transition-colors"
                      placeholder="e.g., 1985"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    About Institute
                  </label>
                  <textarea
                    name="about"
                    value={profile.about}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-300 transition-colors resize-none"
                    placeholder="Tell us about your institute..."
                  />
                </div>
              </div>

              {/* Logo Upload */}
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                <h3 className="text-xl font-semibold text-slate-800 mb-6 flex items-center space-x-2">
                  <Camera className="w-5 h-5" />
                  <span>Logo & Branding</span>
                </h3>

                <div className="space-y-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    name="logo"
                    accept="image/*"
                    onChange={handleChange}
                    className="hidden"
                  />
                  
                  <div className="flex items-center space-x-4">
                    <button
                      type="button"
                      onClick={handleLogoClick}
                      className="px-6 py-3 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors flex items-center space-x-2"
                    >
                      <Upload className="w-5 h-5" />
                      <span>Upload Logo</span>
                    </button>
                    
                    {logoPreview && (
                      <button
                        type="button"
                        onClick={removeLogo}
                        className="px-4 py-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors flex items-center space-x-2"
                      >
                        <X className="w-4 h-4" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>
                  
                  <p className="text-sm text-slate-600">
                    Recommended: Square image, at least 400x400 pixels, PNG or JPG format
                  </p>
                </div>
              </div>

              {/* Social Links */}
              <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
                <h3 className="text-xl font-semibold text-slate-800 mb-6 flex items-center space-x-2">
                  <Globe className="w-5 h-5" />
                  <span>Social Media Links</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(profile.socials).map(([platform, url]) => (
                    <div key={platform}>
                      <label className="block text-sm font-medium text-slate-700 mb-2 capitalize flex items-center space-x-2">
                        {getSocialIcon(platform)}
                        <span>{platform}</span>
                      </label>
                      <input
                        type="url"
                        name={`socials.${platform}`}
                        value={url}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-300 transition-colors"
                        placeholder={`https://${platform}.com/yourpage`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Save className="w-5 h-5" />
                  )}
                  <span>{isLoading ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}