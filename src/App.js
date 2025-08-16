import React, { useState, useRef, useEffect } from 'react';
import { Eye, EyeOff, Bold, Italic, Underline, Link2, Paperclip, Send, Users, TestTube2, X, ChevronDown, ChevronUp, LogOut } from 'lucide-react';

const SHPEEmailSystem = () => {
  // Login State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Email State
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [selectedRange, setSelectedRange] = useState(null);
  
  // Filter State - ALL filters
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [selectedSpecialties, setSelectedSpecialties] = useState([]);
  const [selectedPrograms, setSelectedPrograms] = useState([]);
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  
  // UI State
  const [expandedSections, setExpandedSections] = useState({
    locations: true,
    specialties: true,
    programs: true,
    companies: true
  });
  const [toast, setToast] = useState({ show: false, message: '', type: '' });
  const [recipientCount, setRecipientCount] = useState(0);
  const [fontSize, setFontSize] = useState('normal');

  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const VALID_PASSWORD = 'SHPE2024FAU';
  const WEBHOOK_URL = 'https://gbinetti2020.app.n8n.cloud/webhook-test/shpe-fau-x7k9m2p4q8w3n5h2v9'; // Replace with your actual webhook

  // Complete Data - ALL filters from original
  const locations = {
    'Florida': [
      'Boca Raton', 'Coconut Creek', 'Coral Gables', 'Daytona Beach', 'Deerfield Beach',
      'Delray Beach', 'Fort Lauderdale', 'Gainesville', 'Juno Beach', 'Jupiter',
      'Lake Worth', 'Miami', 'Miramar', 'Orlando', 'Palm Beach Gardens',
      'Plantation', 'Sunrise', 'Tamarac', 'West Palm Beach', 'Weston', 'Florida (General)'
    ],
    'Out of State': [
      'Phoenix AZ', 'Braceville IL', 'Covington LA', 'Lake Como NJ',
      'Doylestown PA', 'Houston TX', 'McKinney TX', 'Virginia'
    ],
    'Other': ['N/A or Blank']
  };

  const specialties = [
    'Mechanical Engineering', 'Electrical Engineering', 'Computer Engineering/Science',
    'Civil Engineering', 'Software Engineer', 'DevOps Engineer', 'Human Resources',
    'HR Specialist', 'Cyber Analyst', 'Security Governance/Risk/Compliance',
    'Materials Science & Engineering', 'Ocean Engineering', 'Aerospace Engineering',
    'Transportation Engineer', 'Water/Wastewater Engineer', 'Project Engineer',
    'Traffic/ITS Engineer', 'UAS Operations/Special Projects', 'N/A or Blank'
  ];

  const programs = [
    { id: 'FAU_Alumni', label: 'FAU Alumni' },
    { id: 'GBM', label: 'GBM Speakers' },
    { id: 'Instagram_Takeover', label: 'Instagram Takeover' },
    { id: 'Company_Tour', label: 'Company Tour' },
    { id: 'Sponsorship', label: 'Sponsorship' },
    { id: 'MentorSHPE', label: 'MentorSHPE' },
    { id: 'SHPEtinas', label: 'SHPEtinas' },
    { id: 'Industry_BBQ', label: 'Industry BBQ' },
    { id: 'Dia_De_Ciencias', label: 'Dia De Ciencias' },
    { id: 'Company_Sponsored_Events', label: 'Company Sponsored Events' },
    { id: 'PD_LeaderSHPE', label: 'Professional Development Day / LeaderSHPE' }
  ];

  const companies = [
    'TEST', // Test company for workflow testing
    'Google', 'Microsoft', 'Apple', 'Meta', 'Amazon', 'Tesla', 'SpaceX',
    'Lockheed Martin', 'Northrop Grumman', 'Boeing', 'Raytheon', 'General Dynamics',
    'L3Harris', 'Collins Aerospace', 'Pratt & Whitney', 'FPL', 'NextEra Energy',
    'JM Family Enterprises', 'Citrix', 'Ultimate Software', 'IBM', 'Intel',
    'AMD', 'NVIDIA', 'Qualcomm', 'Texas Instruments', 'Motorola', 'Siemens',
    'Honeywell', 'General Electric', 'Accenture', 'Deloitte', 'PwC', 'EY', 'KPMG'
  ];

  // Session timeout
  useEffect(() => {
    if (isAuthenticated) {
      const timer = setTimeout(() => {
        handleLogout();
        showToast('Session expired. Please login again.', 'warning');
      }, 2 * 60 * 60 * 1000); // 2 hours
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated]);

  const showToast = (message, type = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  const handleLogin = () => {
    if (password === VALID_PASSWORD) {
      setIsAuthenticated(true);
      setLoginError('');
      showToast('Welcome to SHPE Email System!', 'success');
    } else {
      setLoginError('Invalid password. Please try again.');
      setPassword('');
    }
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      setIsAuthenticated(false);
      setPassword('');
      // Reset all states
      setEmailSubject('');
      setEmailBody('');
      setAttachments([]);
      setSelectedLocations([]);
      setSelectedSpecialties([]);
      setSelectedPrograms([]);
      setSelectedCompanies([]);
    }
  };

  const insertMergeTag = (tag) => {
    const editor = editorRef.current;
    if (editor) {
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      
      const tagElement = document.createElement('span');
      tagElement.style.cssText = 'background: linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 100%); padding: 2px 6px; border-radius: 4px; font-weight: 600; color: #4338CA; display: inline-block; margin: 0 2px;';
      tagElement.contentEditable = 'false';
      tagElement.textContent = tag;
      
      range.deleteContents();
      range.insertNode(tagElement);
      
      // Add space after tag
      const space = document.createTextNode('\u00A0');
      tagElement.parentNode.insertBefore(space, tagElement.nextSibling);
      
      // Move cursor after space
      range.setStartAfter(space);
      range.setEndAfter(space);
      selection.removeAllRanges();
      selection.addRange(range);
      
      editor.focus();
      showToast(`${tag} inserted!`, 'success');
    }
  };

  const handleBold = () => {
    document.execCommand('bold');
    editorRef.current?.focus();
  };

  const handleItalic = () => {
    document.execCommand('italic');
    editorRef.current?.focus();
  };

  const handleUnderline = () => {
    document.execCommand('underline');
    editorRef.current?.focus();
  };

  const handleFontSize = (size) => {
    const sizes = { 'small': '2', 'normal': '3', 'large': '5', 'xlarge': '7' };
    document.execCommand('fontSize', false, sizes[size]);
    setFontSize(size);
    editorRef.current?.focus();
  };

  const toggleLink = () => {
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    
    // Check if we're in a link
    let linkElement = null;
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const container = range.commonAncestorContainer;
      let node = container.nodeType === 3 ? container.parentNode : container;
      
      while (node && node !== editorRef.current) {
        if (node.tagName === 'A') {
          linkElement = node;
          break;
        }
        node = node.parentNode;
      }
    }
    
    if (linkElement) {
      // Remove link
      const textNode = document.createTextNode(linkElement.textContent);
      linkElement.parentNode.replaceChild(textNode, linkElement);
      showToast('Link removed', 'success');
    } else if (selectedText) {
      // Show link modal
      setSelectedRange(selection.getRangeAt(0));
      setShowLinkModal(true);
    } else {
      showToast('Please select text to create a link', 'error');
    }
  };

  const insertLink = () => {
    if (linkUrl && selectedRange) {
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(selectedRange);
      
      const url = linkUrl.match(/^https?:\/\//) ? linkUrl : 'https://' + linkUrl;
      document.execCommand('createLink', false, url);
      
      // Style the link
      const links = editorRef.current?.getElementsByTagName('a');
      if (links && links.length > 0) {
        const newLink = links[links.length - 1];
        newLink.style.color = '#2563EB';
        newLink.style.textDecoration = 'underline';
        newLink.target = '_blank';
      }
      
      setShowLinkModal(false);
      setLinkUrl('');
      setSelectedRange(null);
      showToast('Link added successfully', 'success');
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const maxFileSize = 5 * 1024 * 1024; // 5MB per file
    const maxTotalSize = 10 * 1024 * 1024; // 10MB total
    
    let totalSize = attachments.reduce((sum, file) => sum + file.size, 0);
    const validFiles = [];
    
    for (const file of files) {
      if (file.size > maxFileSize) {
        showToast(`${file.name} exceeds 5MB limit`, 'error');
        continue;
      }
      if (totalSize + file.size > maxTotalSize) {
        showToast('Total attachment size would exceed 10MB', 'error');
        break;
      }
      validFiles.push(file);
      totalSize += file.size;
    }
    
    setAttachments(prev => [...prev, ...validFiles]);
    e.target.value = '';
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
    showToast('Attachment removed', 'success');
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const selectAllInCategory = (category) => {
    if (category === 'locations') {
      const allLocs = Object.values(locations).flat();
      setSelectedLocations(selectedLocations.length === allLocs.length ? [] : allLocs);
    } else if (category === 'specialties') {
      setSelectedSpecialties(selectedSpecialties.length === specialties.length ? [] : specialties);
    } else if (category === 'programs') {
      const allPrograms = programs.map(p => p.id);
      setSelectedPrograms(selectedPrograms.length === allPrograms.length ? [] : allPrograms);
    } else if (category === 'companies') {
      setSelectedCompanies(selectedCompanies.length === companies.length ? [] : companies);
    }
  };

  const handleCountRecipients = async () => {
    const filters = {
      locations: selectedLocations,
      specialties: selectedSpecialties,
      programs: selectedPrograms,
      companies: selectedCompanies
    };

    try {
      const response = await fetch(`${WEBHOOK_URL}?action=count`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filters })
      });
      
      const data = await response.json();
      setRecipientCount(data.count);
      showToast(`${data.count} recipients match your filters`, 'info');
    } catch (error) {
      showToast('Error counting recipients. Check webhook URL.', 'error');
    }
  };

  const handleSendTestEmail = async () => {
    if (!emailSubject || !emailBody) {
      showToast('Please enter subject and message', 'error');
      return;
    }

    const emailData = {
      subject: '[TEST] ' + emailSubject,
      body: editorRef.current?.innerHTML || emailBody,
      filters: {
        locations: selectedLocations,
        specialties: selectedSpecialties,
        programs: selectedPrograms,
        companies: selectedCompanies
      }
    };

    try {
      const response = await fetch(`${WEBHOOK_URL}?action=test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailData)
      });
      
      if (response.ok) {
        showToast('Test email sent successfully!', 'success');
      }
    } catch (error) {
      showToast('Error sending test email. Check webhook URL.', 'error');
    }
  };

  const handleSendEmails = async () => {
    if (!emailSubject || !emailBody) {
      showToast('Please enter subject and message', 'error');
      return;
    }

    const filterCount = selectedLocations.length + selectedSpecialties.length + 
                       selectedPrograms.length + selectedCompanies.length;
    
    if (filterCount === 0) {
      showToast('Please select at least one filter', 'error');
      return;
    }

    if (!window.confirm(`Are you sure you want to send emails to ${recipientCount || 'selected'} recipients?`)) {
      return;
    }

    const emailData = {
      subject: emailSubject,
      body: editorRef.current?.innerHTML || emailBody,
      filters: {
        locations: selectedLocations,
        specialties: selectedSpecialties,
        programs: selectedPrograms,
        companies: selectedCompanies
      },
      attachments: attachments
    };

    try {
      const response = await fetch(`${WEBHOOK_URL}?action=send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailData)
      });
      
      if (response.ok) {
        showToast('Emails sent successfully!', 'success');
        // Reset form
        setEmailSubject('');
        setEmailBody('');
        editorRef.current.innerHTML = '';
        setAttachments([]);
      }
    } catch (error) {
      showToast('Error sending emails. Check webhook URL.', 'error');
    }
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #152a45 100%)' }}>
        <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full mx-4">
          <div className="text-center">
            {/* SHPE Logo */}
            <div className="w-32 h-32 mx-auto mb-6">
              <svg viewBox="0 0 200 200" className="w-full h-full">
                <rect width="200" height="200" fill="#FF6B35" rx="20"/>
                <text x="100" y="110" textAnchor="middle" fill="white" fontSize="48" fontWeight="bold">SHPE</text>
                <text x="100" y="140" textAnchor="middle" fill="white" fontSize="14">FAU Chapter</text>
              </svg>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Professional Email System</h1>
            <p className="text-gray-600 italic mb-8">Leading Hispanics in STEM®</p>
          </div>
          
          <div className="space-y-4">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="Enter password"
                className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors text-lg"
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 p-1"
              >
                {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
              </button>
            </div>
            
            {loginError && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                {loginError}
              </div>
            )}
            
            <button
              onClick={handleLogin}
              className="w-full py-3 text-white font-semibold rounded-lg transition-all transform hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #FF6B35 0%, #F7931E 100%)' }}
            >
              Login to System
            </button>
          </div>
          
          <div className="mt-6 text-center text-sm text-gray-500">
            Access restricted to SHPE FAU team members
          </div>
        </div>
      </div>
    );
  }

  // Main Application
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12">
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  <rect width="200" height="200" fill="#FF6B35" rx="20"/>
                  <text x="100" y="125" textAnchor="middle" fill="white" fontSize="72" fontWeight="bold">SHPE</text>
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Professional Email System</h1>
                <p className="text-sm text-gray-600 italic">Leading Hispanics in STEM®</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-6">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">Recipient Filters</h2>
                <p className="text-xs text-gray-500 mt-1">Select filters to target specific groups</p>
              </div>
              
              {/* Locations Filter */}
              <div className="border-b border-gray-200">
                <button
                  onClick={() => toggleSection('locations')}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-700">
                    Locations {selectedLocations.length > 0 && `(${selectedLocations.length})`}
                  </span>
                  {expandedSections.locations ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {expandedSections.locations && (
                  <div className="px-4 pb-3 max-h-64 overflow-y-auto">
                    <button
                      onClick={() => selectAllInCategory('locations')}
                      className="text-xs text-blue-600 hover:text-blue-800 mb-2"
                    >
                      {selectedLocations.length === Object.values(locations).flat().length ? 'Deselect All' : 'Select All'}
                    </button>
                    {Object.entries(locations).map(([category, locs]) => (
                      <div key={category} className="mb-3">
                        <div className="text-xs font-semibold text-gray-600 mb-1">{category}</div>
                        {locs.map(location => (
                          <label key={location} className="flex items-center py-1 cursor-pointer hover:bg-gray-50 rounded px-1">
                            <input
                              type="checkbox"
                              checked={selectedLocations.includes(location)}
                              onChange={() => setSelectedLocations(prev =>
                                prev.includes(location)
                                  ? prev.filter(l => l !== location)
                                  : [...prev, location]
                              )}
                              className="mr-2 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                            />
                            <span className="text-sm text-gray-700">{location}</span>
                          </label>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Specialties Filter */}
              <div className="border-b border-gray-200">
                <button
                  onClick={() => toggleSection('specialties')}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-700">
                    Specialties {selectedSpecialties.length > 0 && `(${selectedSpecialties.length})`}
                  </span>
                  {expandedSections.specialties ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {expandedSections.specialties && (
                  <div className="px-4 pb-3 max-h-64 overflow-y-auto">
                    <button
                      onClick={() => selectAllInCategory('specialties')}
                      className="text-xs text-blue-600 hover:text-blue-800 mb-2"
                    >
                      {selectedSpecialties.length === specialties.length ? 'Deselect All' : 'Select All'}
                    </button>
                    {specialties.map(specialty => (
                      <label key={specialty} className="flex items-center py-1 cursor-pointer hover:bg-gray-50 rounded px-1">
                        <input
                          type="checkbox"
                          checked={selectedSpecialties.includes(specialty)}
                          onChange={() => setSelectedSpecialties(prev =>
                            prev.includes(specialty)
                              ? prev.filter(s => s !== specialty)
                              : [...prev, specialty]
                          )}
                          className="mr-2 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                        />
                        <span className="text-sm text-gray-700">{specialty}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Programs Filter */}
              <div className="border-b border-gray-200">
                <button
                  onClick={() => toggleSection('programs')}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-700">
                    Programs {selectedPrograms.length > 0 && `(${selectedPrograms.length})`}
                  </span>
                  {expandedSections.programs ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {expandedSections.programs && (
                  <div className="px-4 pb-3 max-h-64 overflow-y-auto">
                    <button
                      onClick={() => selectAllInCategory('programs')}
                      className="text-xs text-blue-600 hover:text-blue-800 mb-2"
                    >
                      {selectedPrograms.length === programs.length ? 'Deselect All' : 'Select All'}
                    </button>
                    {programs.map(program => (
                      <label key={program.id} className="flex items-center py-1 cursor-pointer hover:bg-gray-50 rounded px-1">
                        <input
                          type="checkbox"
                          checked={selectedPrograms.includes(program.id)}
                          onChange={() => setSelectedPrograms(prev =>
                            prev.includes(program.id)
                              ? prev.filter(p => p !== program.id)
                              : [...prev, program.id]
                          )}
                          className="mr-2 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                        />
                        <span className="text-sm text-gray-700">{program.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Companies Filter */}
              <div>
                <button
                  onClick={() => toggleSection('companies')}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-700">
                    Companies {selectedCompanies.length > 0 && `(${selectedCompanies.length})`}
                  </span>
                  {expandedSections.companies ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                {expandedSections.companies && (
                  <div className="px-4 pb-3 max-h-64 overflow-y-auto">
                    <button
                      onClick={() => selectAllInCategory('companies')}
                      className="text-xs text-blue-600 hover:text-blue-800 mb-2"
                    >
                      {selectedCompanies.length === companies.length ? 'Deselect All' : 'Select All'}
                    </button>
                    {companies.map(company => (
                      <label key={company} className="flex items-center py-1 cursor-pointer hover:bg-gray-50 rounded px-1">
                        <input
                          type="checkbox"
                          checked={selectedCompanies.includes(company)}
                          onChange={() => setSelectedCompanies(prev =>
                            prev.includes(company)
                              ? prev.filter(c => c !== company)
                              : [...prev, company]
                          )}
                          className="mr-2 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                        />
                        <span className="text-sm text-gray-700">{company}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Email Composer */}
          <div className="lg:col-span-3 space-y-4">
            {/* Email Subject */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Subject</label>
              <input
                type="text"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Enter your email subject..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-orange-500 focus:ring-1 focus:ring-orange-500 focus:outline-none"
              />
            </div>

            {/* Email Editor */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Toolbar */}
              <div className="border-b border-gray-200 p-3">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleBold}
                    className="p-2 hover:bg-gray-100 rounded transition-colors"
                    title="Bold"
                  >
                    <Bold size={18} />
                  </button>
                  <button
                    onClick={handleItalic}
                    className="p-2 hover:bg-gray-100 rounded transition-colors"
                    title="Italic"
                  >
                    <Italic size={18} />
                  </button>
                  <button
                    onClick={handleUnderline}
                    className="p-2 hover:bg-gray-100 rounded transition-colors"
                    title="Underline"
                  >
                    <Underline size={18} />
                  </button>
                  <div className="w-px h-6 bg-gray-300 mx-1" />
                  <button
                    onClick={() => handleFontSize('small')}
                    className={`px-3 py-1 rounded hover:bg-gray-100 ${fontSize === 'small' ? 'bg-gray-200' : ''}`}
                    title="Small"
                  >
                    <span className="text-xs">S</span>
                  </button>
                  <button
                    onClick={() => handleFontSize('normal')}
                    className={`px-3 py-1 rounded hover:bg-gray-100 ${fontSize === 'normal' ? 'bg-gray-200' : ''}`}
                    title="Normal"
                  >
                    <span className="text-sm">M</span>
                  </button>
                  <button
                    onClick={() => handleFontSize('large')}
                    className={`px-3 py-1 rounded hover:bg-gray-100 ${fontSize === 'large' ? 'bg-gray-200' : ''}`}
                    title="Large"
                  >
                    <span className="text-base">L</span>
                  </button>
                  <button
                    onClick={() => handleFontSize('xlarge')}
                    className={`px-3 py-1 rounded hover:bg-gray-100 ${fontSize === 'xlarge' ? 'bg-gray-200' : ''}`}
                    title="Extra Large"
                  >
                    <span className="text-lg">XL</span>
                  </button>
                  <div className="w-px h-6 bg-gray-300 mx-1" />
                  <button
                    onClick={toggleLink}
                    className="p-2 hover:bg-gray-100 rounded transition-colors"
                    title="Insert/Remove Link"
                  >
                    <Link2 size={18} />
                  </button>
                </div>
              </div>

              {/* Merge Tags */}
              <div className="border-b border-gray-200 p-3 bg-gray-50">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">Merge Tags:</span>
                  {['{{first_name}}', '{{last_name}}', '{{company}}', '{{specialty}}', '{{location}}'].map(tag => (
                    <button
                      key={tag}
                      onClick={() => insertMergeTag(tag)}
                      className="px-3 py-1 text-sm rounded-full transition-all hover:scale-105"
                      style={{ 
                        background: 'linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 100%)',
                        color: '#4338CA',
                        fontWeight: '600'
                      }}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Editor */}
              <div className="p-4">
                <div
                  ref={editorRef}
                  contentEditable
                  className="min-h-[300px] p-4 border border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  style={{ lineHeight: '1.6' }}
                  placeholder="Type your email message here..."
                  onInput={(e) => setEmailBody(e.target.innerHTML)}
                />
              </div>
            </div>

            {/* Attachments */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-gray-700">Attachments</label>
                <span className="text-xs text-gray-500">Max 5MB per file, 10MB total</span>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Paperclip size={18} />
                <span>Add Attachment</span>
              </button>
              
              {attachments.length > 0 && (
                <div className="mt-3 space-y-2">
                  {attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Paperclip size={16} className="text-gray-500" />
                        <span className="text-sm text-gray-700">{file.name}</span>
                        <span className="text-xs text-gray-500">({formatFileSize(file.size)})</span>
                      </div>
                      <button
                        onClick={() => removeAttachment(index)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleCountRecipients}
                  className="flex items-center space-x-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
                >
                  <Users size={18} />
                  <span>Count Recipients</span>
                  {recipientCount > 0 && (
                    <span className="ml-1 px-2 py-0.5 bg-white text-blue-500 rounded-full text-sm font-bold">
                      {recipientCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={handleSendTestEmail}
                  className="flex items-center space-x-2 px-5 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors font-medium"
                >
                  <TestTube2 size={18} />
                  <span>Send Test Email</span>
                </button>
                <button
                  onClick={handleSendEmails}
                  className="flex items-center space-x-2 px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-medium"
                >
                  <Send size={18} />
                  <span>Send Emails</span>
                </button>
              </div>
              <div className="mt-3 text-xs text-gray-500">
                Test emails will have [TEST] prefix. Production emails will be sent to all filtered recipients.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Link Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Insert Link</h3>
            <input
              type="text"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && insertLink()}
              placeholder="https://example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none mb-4"
              autoFocus
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowLinkModal(false);
                  setLinkUrl('');
                  setSelectedRange(null);
                }}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={insertLink}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                Insert Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white transition-all transform animate-pulse ${
          toast.type === 'success' ? 'bg-green-500' :
          toast.type === 'error' ? 'bg-red-500' :
          toast.type === 'warning' ? 'bg-yellow-500' :
          'bg-blue-500'
        }`}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default SHPEEmailSystem;