'use client';

import React, { useState, useEffect } from 'react';

const PublicServiceNumbers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCountry, setSelectedCountry] = useState('US');
  const [filteredServices, setFilteredServices] = useState([]);
  const [copied, setCopied] = useState('');

  // Comprehensive public service numbers database
  const serviceNumbers = {
    'US': {
      country: 'United States',
      flag: '🇺🇸',
      services: [
        // Emergency Services
        { name: 'Emergency (Police, Fire, Medical)', number: '911', category: 'Emergency', description: '24/7 emergency response for life-threatening situations', icon: '🚨' },
        { name: 'Poison Control Center', number: '1-800-222-1222', category: 'Emergency', description: '24/7 poison emergency helpline', icon: '☠️' },
        { name: 'National Suicide Prevention Lifeline', number: '988', category: 'Emergency', description: '24/7 crisis support and suicide prevention', icon: '💙' },
        { name: 'Crisis Text Line', number: 'Text HOME to 741741', category: 'Emergency', description: '24/7 crisis support via text message', icon: '💬' },
        
        // Government Services
        { name: 'Internal Revenue Service (IRS)', number: '1-800-829-1040', category: 'Government', description: 'Tax questions and assistance', icon: '💰' },
        { name: 'Social Security Administration', number: '1-800-772-1213', category: 'Government', description: 'Social Security benefits and services', icon: '🏛️' },
        { name: 'Medicare', number: '1-800-633-4227', category: 'Government', description: 'Medicare enrollment and benefits', icon: '🏥' },
        { name: 'Medicaid', number: '1-877-267-2323', category: 'Government', description: 'Medicaid enrollment and information', icon: '🏥' },
        { name: 'USPS Customer Service', number: '1-800-275-8777', category: 'Government', description: 'US Postal Service customer support', icon: '📮' },
        { name: 'Passport Services', number: '1-877-487-2778', category: 'Government', description: 'Passport applications and status', icon: '📘' },
        { name: 'Immigration Services (USCIS)', number: '1-800-375-5283', category: 'Government', description: 'Immigration and citizenship services', icon: '🛂' },
        
        // Health Services
        { name: 'CDC Public Health Emergency', number: '1-800-232-4636', category: 'Healthcare', description: 'Centers for Disease Control information', icon: '🏥' },
        { name: 'National Health Information Center', number: '1-800-336-4797', category: 'Healthcare', description: 'General health information and resources', icon: '🩺' },
        { name: 'Mental Health America', number: '1-800-969-6642', category: 'Healthcare', description: 'Mental health resources and support', icon: '🧠' },
        { name: 'SAMHSA National Helpline', number: '1-800-662-4357', category: 'Healthcare', description: 'Substance abuse and mental health services', icon: '💊' },
        
        // Consumer Services
        { name: 'Federal Trade Commission', number: '1-877-382-4357', category: 'Consumer', description: 'Consumer protection and fraud reporting', icon: '🛡️' },
        { name: 'Better Business Bureau', number: '1-703-276-0100', category: 'Consumer', description: 'Business complaints and ratings', icon: '⭐' },
        { name: 'Consumer Financial Protection Bureau', number: '1-855-411-2372', category: 'Consumer', description: 'Financial services complaints', icon: '💳' },
        
        // Transportation
        { name: 'Department of Transportation', number: '1-202-366-4000', category: 'Transportation', description: 'Transportation safety and regulations', icon: '🚗' },
        { name: 'Aviation Safety Hotline', number: '1-800-255-1111', category: 'Transportation', description: 'Report aviation safety concerns', icon: '✈️' },
        { name: 'Railroad Safety', number: '1-800-401-4642', category: 'Transportation', description: 'Railroad safety violations and concerns', icon: '🚂' },
        
        // Utilities & Infrastructure
        { name: 'National Power Grid Emergency', number: '1-202-586-8100', category: 'Utilities', description: 'Power grid emergencies and outages', icon: '⚡' },
        { name: 'Natural Gas Emergency', number: '811', category: 'Utilities', description: 'Call before you dig - utility marking', icon: '🔥' },
        
        // Legal Aid
        { name: 'Legal Aid Society', number: '1-212-577-3300', category: 'Legal', description: 'Free legal assistance for low-income individuals', icon: '⚖️' },
        { name: 'American Bar Association', number: '1-312-988-5000', category: 'Legal', description: 'Lawyer referral and legal information', icon: '👨‍💼' },
        
        // Veterans Services
        { name: 'Veterans Affairs', number: '1-800-827-1000', category: 'Veterans', description: 'VA benefits and services', icon: '🎖️' },
        { name: 'Veterans Crisis Line', number: '1-800-273-8255', category: 'Veterans', description: '24/7 crisis support for veterans', icon: '🎖️' }
      ]
    },
    'CA': {
      country: 'Canada',
      flag: '🇨🇦',
      services: [
        // Emergency Services
        { name: 'Emergency Services', number: '911', category: 'Emergency', description: '24/7 emergency response', icon: '🚨' },
        { name: 'Poison Control', number: '1-844-764-7669', category: 'Emergency', description: '24/7 poison information', icon: '☠️' },
        { name: 'Crisis Services Canada', number: '1-833-456-4566', category: 'Emergency', description: '24/7 crisis support', icon: '💙' },
        
        // Government Services
        { name: 'Canada Revenue Agency', number: '1-800-959-8281', category: 'Government', description: 'Tax information and services', icon: '💰' },
        { name: 'Service Canada', number: '1-800-622-6232', category: 'Government', description: 'Government services and benefits', icon: '🏛️' },
        { name: 'Employment Insurance', number: '1-800-206-7218', category: 'Government', description: 'EI benefits and claims', icon: '💼' },
        { name: 'Canada Post', number: '1-866-607-6301', category: 'Government', description: 'Postal services', icon: '📮' },
        { name: 'Passport Program', number: '1-800-567-6868', category: 'Government', description: 'Passport services', icon: '📘' },
        
        // Health Services
        { name: 'Health Canada', number: '1-866-225-0709', category: 'Healthcare', description: 'Health information and services', icon: '🏥' },
        { name: 'Kids Help Phone', number: '1-800-668-6868', category: 'Healthcare', description: '24/7 support for youth', icon: '👶' },
        
        // Consumer Services
        { name: 'Competition Bureau', number: '1-800-348-5358', category: 'Consumer', description: 'Consumer protection', icon: '🛡️' },
        { name: 'Canadian Anti-Fraud Centre', number: '1-888-495-8501', category: 'Consumer', description: 'Fraud reporting', icon: '🚫' }
      ]
    },
    'GB': {
      country: 'United Kingdom',
      flag: '🇬🇧',
      services: [
        // Emergency Services
        { name: 'Emergency Services', number: '999', category: 'Emergency', description: '24/7 emergency response', icon: '🚨' },
        { name: 'Non-Emergency Police', number: '101', category: 'Emergency', description: 'Non-urgent police matters', icon: '👮' },
        { name: 'NHS Non-Emergency', number: '111', category: 'Emergency', description: 'Non-emergency medical advice', icon: '🏥' },
        { name: 'Samaritans', number: '116 123', category: 'Emergency', description: 'Emotional support', icon: '💙' },
        
        // Government Services
        { name: 'HMRC', number: '0300 200 3300', category: 'Government', description: 'Tax and customs', icon: '💰' },
        { name: 'DVLA', number: '0300 790 6801', category: 'Government', description: 'Driver and vehicle licensing', icon: '🚗' },
        { name: 'NHS', number: '0300 311 2233', category: 'Government', description: 'National Health Service', icon: '🏥' },
        { name: 'Passport Office', number: '0300 222 0000', category: 'Government', description: 'Passport services', icon: '📘' },
        
        // Utilities
        { name: 'National Grid', number: '0800 111 999', category: 'Utilities', description: 'Gas emergency', icon: '🔥' },
        { name: 'Electricity Emergency', number: '105', category: 'Utilities', description: 'Power outages', icon: '⚡' }
      ]
    },
    'AU': {
      country: 'Australia',
      flag: '🇦🇺',
      services: [
        // Emergency Services
        { name: 'Emergency Services', number: '000', category: 'Emergency', description: '24/7 emergency response', icon: '🚨' },
        { name: 'Poison Information', number: '13 11 26', category: 'Emergency', description: 'Poison information', icon: '☠️' },
        { name: 'Lifeline', number: '13 11 14', category: 'Emergency', description: 'Crisis support', icon: '💙' },
        
        // Government Services
        { name: 'Australian Taxation Office', number: '13 28 61', category: 'Government', description: 'Tax services', icon: '💰' },
        { name: 'Centrelink', number: '13 24 68', category: 'Government', description: 'Government payments', icon: '🏛️' },
        { name: 'Medicare', number: '13 20 11', category: 'Government', description: 'Healthcare services', icon: '🏥' },
        { name: 'Australia Post', number: '13 76 78', category: 'Government', description: 'Postal services', icon: '📮' },
        
        // Consumer Services
        { name: 'ACCC', number: '1300 302 502', category: 'Consumer', description: 'Consumer protection', icon: '🛡️' },
        { name: 'Scamwatch', number: '1300 795 995', category: 'Consumer', description: 'Scam reporting', icon: '🚫' }
      ]
    },
    'DE': {
      country: 'Germany',
      flag: '🇩🇪',
      services: [
        // Emergency Services
        { name: 'Emergency Services', number: '112', category: 'Emergency', description: '24/7 emergency response', icon: '🚨' },
        { name: 'Police', number: '110', category: 'Emergency', description: 'Police emergency', icon: '👮' },
        { name: 'Poison Control', number: '030 19240', category: 'Emergency', description: 'Poison information (Berlin)', icon: '☠️' },
        { name: 'Telefonseelsorge', number: '0800 111 0 111', category: 'Emergency', description: 'Crisis support', icon: '💙' },
        
        // Government Services
        { name: 'Bundesagentur für Arbeit', number: '0800 4 5555 00', category: 'Government', description: 'Employment services', icon: '💼' },
        { name: 'Deutsche Post', number: '0228 4333112', category: 'Government', description: 'Postal services', icon: '📮' },
        { name: 'Finanzamt Info', number: '0800 0000 347', category: 'Government', description: 'Tax office information', icon: '💰' }
      ]
    },
    'FR': {
      country: 'France',
      flag: '🇫🇷',
      services: [
        // Emergency Services
        { name: 'Emergency Services', number: '112', category: 'Emergency', description: '24/7 emergency response', icon: '🚨' },
        { name: 'Police', number: '17', category: 'Emergency', description: 'Police emergency', icon: '👮' },
        { name: 'Fire Department', number: '18', category: 'Emergency', description: 'Fire and rescue', icon: '🚒' },
        { name: 'Medical Emergency (SAMU)', number: '15', category: 'Emergency', description: 'Medical emergency', icon: '🚑' },
        { name: 'SOS Amitié', number: '09 72 39 40 50', category: 'Emergency', description: 'Crisis support', icon: '💙' },
        
        // Government Services
        { name: 'Service Public', number: '3939', category: 'Government', description: 'Public service information', icon: '🏛️' },
        { name: 'La Poste', number: '3631', category: 'Government', description: 'Postal services', icon: '📮' },
        { name: 'Impôts Service', number: '0809 401 401', category: 'Government', description: 'Tax services', icon: '💰' }
      ]
    },
    'CN': {
      country: 'China',
      flag: '🇨🇳',
      services: [
        // Emergency Services
        { name: 'Emergency Services', number: '110', category: 'Emergency', description: 'Police emergency', icon: '👮' },
        { name: 'Fire Department', number: '119', category: 'Emergency', description: 'Fire and rescue services', icon: '🚒' },
        { name: 'Medical Emergency', number: '120', category: 'Emergency', description: 'Medical emergency services', icon: '🚑' },
        { name: 'Traffic Accidents', number: '122', category: 'Emergency', description: 'Traffic accident reporting', icon: '🚗' },
        { name: 'Beijing Crisis Intervention', number: '400-161-9995', category: 'Emergency', description: 'Mental health crisis support', icon: '💙' },
        
        // Government Services
        { name: 'Tax Service Hotline', number: '12366', category: 'Government', description: 'National tax service hotline', icon: '💰' },
        { name: 'China Post', number: '11185', category: 'Government', description: 'Postal services', icon: '📮' },
        { name: 'Social Security', number: '12333', category: 'Government', description: 'Social security and employment services', icon: '🏛️' },
        { name: 'Consumer Rights', number: '12315', category: 'Government', description: 'Consumer protection and complaints', icon: '🛡️' },
        { name: 'Environmental Protection', number: '12369', category: 'Government', description: 'Environmental pollution reporting', icon: '🌱' },
        { name: 'National Health Commission', number: '12320', category: 'Government', description: 'Public health services', icon: '🏥' },
        
        // Healthcare Services
        { name: 'Health Information', number: '12320', category: 'Healthcare', description: 'National health information service', icon: '🩺' },
        { name: 'Beijing Mental Health', number: '400-161-9995', category: 'Healthcare', description: 'Mental health support (Beijing)', icon: '🧠' },
        { name: 'Shanghai Mental Health', number: '021-64387250', category: 'Healthcare', description: 'Mental health support (Shanghai)', icon: '🧠' },
        
        // Consumer Services
        { name: 'Consumer Protection', number: '12315', category: 'Consumer', description: 'Consumer rights and complaints', icon: '⭐' },
        { name: 'Quality Supervision', number: '12365', category: 'Consumer', description: 'Product quality complaints', icon: '🛡️' },
        { name: 'Food Safety', number: '12331', category: 'Consumer', description: 'Food and drug safety complaints', icon: '🍽️' },
        
        // Transportation
        { name: 'Traffic Management', number: '122', category: 'Transportation', description: 'Traffic accidents and violations', icon: '🚦' },
        { name: 'Railway Services', number: '12306', category: 'Transportation', description: 'Railway ticket booking and services', icon: '🚄' },
        
        // Utilities
        { name: 'Power Grid Emergency', number: '95598', category: 'Utilities', description: 'State Grid customer service', icon: '⚡' },
        { name: 'Water Services', number: '96116', category: 'Utilities', description: 'Water supply services (varies by city)', icon: '💧' },
        
        // Legal Aid
        { name: 'Legal Aid', number: '12348', category: 'Legal', description: 'Public legal services', icon: '⚖️' },
        { name: 'Judicial Services', number: '12348', category: 'Legal', description: 'Legal consultation and aid', icon: '👨‍💼' }
      ]
    },
    'JP': {
      country: 'Japan',
      flag: '🇯🇵',
      services: [
        // Emergency Services
        { name: 'Police Emergency', number: '110', category: 'Emergency', description: 'Police emergency services', icon: '👮' },
        { name: 'Fire & Ambulance', number: '119', category: 'Emergency', description: 'Fire department and ambulance services', icon: '🚨' },
        { name: 'Coast Guard', number: '118', category: 'Emergency', description: 'Japan Coast Guard emergency', icon: '🚢' },
        { name: 'Tokyo Mental Health Crisis', number: '03-3264-4343', category: 'Emergency', description: 'Mental health crisis support (Tokyo)', icon: '💙' },
        
        // Government Services
        { name: 'National Tax Agency', number: '0570-00-5901', category: 'Government', description: 'Tax consultation and services', icon: '💰' },
        { name: 'Japan Post', number: '0120-23-28-86', category: 'Government', description: 'Postal services', icon: '📮' },
        { name: 'Pension Service', number: '0570-05-1165', category: 'Government', description: 'National pension services', icon: '🏛️' },
        { name: 'Immigration Services', number: '0570-013904', category: 'Government', description: 'Immigration and visa services', icon: '🛂' },
        { name: 'Hello Work', number: '0570-015-010', category: 'Government', description: 'Employment services', icon: '💼' },
        
        // Healthcare Services
        { name: 'Ministry of Health', number: '03-5253-1111', category: 'Healthcare', description: 'Ministry of Health, Labour and Welfare', icon: '🏥' },
        { name: 'Mental Health Hotline', number: '0570-064-556', category: 'Healthcare', description: 'Mental health consultation', icon: '🧠' },
        { name: 'Child Abuse Hotline', number: '189', category: 'Healthcare', description: 'Child abuse reporting', icon: '👶' },
        
        // Consumer Services
        { name: 'Consumer Affairs Agency', number: '03-3507-8800', category: 'Consumer', description: 'Consumer protection and complaints', icon: '🛡️' },
        { name: 'National Consumer Center', number: '188', category: 'Consumer', description: 'Consumer hotline', icon: '⭐' },
        
        // Transportation
        { name: 'Japan Transport Safety', number: '03-5253-8111', category: 'Transportation', description: 'Transportation safety board', icon: '🚗' },
        
        // Utilities
        { name: 'Tokyo Electric Power', number: '0120-995-007', category: 'Utilities', description: 'TEPCO customer service', icon: '⚡' }
      ]
    },
    'KR': {
      country: 'South Korea',
      flag: '🇰🇷',
      services: [
        // Emergency Services
        { name: 'Police Emergency', number: '112', category: 'Emergency', description: 'Police emergency services', icon: '👮' },
        { name: 'Fire & Medical Emergency', number: '119', category: 'Emergency', description: 'Fire department and ambulance', icon: '🚨' },
        { name: 'Coast Guard', number: '122', category: 'Emergency', description: 'Korea Coast Guard', icon: '🚢' },
        { name: 'Mental Health Crisis', number: '1393', category: 'Emergency', description: 'Mental health crisis counseling', icon: '💙' },
        { name: 'Suicide Prevention', number: '1588-9191', category: 'Emergency', description: 'Suicide prevention hotline', icon: '💙' },
        
        // Government Services
        { name: 'National Tax Service', number: '126', category: 'Government', description: 'Tax services and consultation', icon: '💰' },
        { name: 'Korea Post', number: '1588-1300', category: 'Government', description: 'Postal services', icon: '📮' },
        { name: 'National Pension Service', number: '1355', category: 'Government', description: 'Pension and social security', icon: '🏛️' },
        { name: 'Immigration Office', number: '1345', category: 'Government', description: 'Immigration services', icon: '🛂' },
        { name: 'Employment Services', number: '1350', category: 'Government', description: 'Job placement and unemployment', icon: '💼' },
        
        // Healthcare Services
        { name: 'Ministry of Health', number: '129', category: 'Healthcare', description: 'Health and welfare services', icon: '🏥' },
        { name: 'National Health Insurance', number: '1577-1000', category: 'Healthcare', description: 'Health insurance services', icon: '🩺' },
        { name: 'Mental Health Center', number: '1577-0199', category: 'Healthcare', description: 'Mental health support', icon: '🧠' },
        
        // Consumer Services
        { name: 'Consumer Protection', number: '1372', category: 'Consumer', description: 'Consumer rights and complaints', icon: '🛡️' },
        { name: 'Fair Trade Commission', number: '1588-1111', category: 'Consumer', description: 'Fair trade and competition', icon: '⭐' },
        
        // Transportation
        { name: 'Transport Ministry', number: '1599-0001', category: 'Transportation', description: 'Transportation services', icon: '🚗' },
        
        // Utilities
        { name: 'Korea Electric Power', number: '123', category: 'Utilities', description: 'KEPCO customer service', icon: '⚡' }
      ]
    },
    'IN': {
      country: 'India',
      flag: '🇮🇳',
      services: [
        // Emergency Services
        { name: 'Police Emergency', number: '100', category: 'Emergency', description: 'Police emergency services', icon: '👮' },
        { name: 'Fire Services', number: '101', category: 'Emergency', description: 'Fire department', icon: '🚒' },
        { name: 'Ambulance', number: '108', category: 'Emergency', description: 'Medical emergency services', icon: '🚑' },
        { name: 'Disaster Management', number: '108', category: 'Emergency', description: 'National disaster response', icon: '🚨' },
        { name: 'Women Helpline', number: '1091', category: 'Emergency', description: 'Women in distress helpline', icon: '👩' },
        { name: 'Child Helpline', number: '1098', category: 'Emergency', description: 'Child abuse and missing children', icon: '👶' },
        { name: 'Senior Citizen Helpline', number: '1291', category: 'Emergency', description: 'Elder abuse helpline', icon: '👴' },
        
        // Government Services
        { name: 'Income Tax Helpline', number: '1800-180-1961', category: 'Government', description: 'Income tax services', icon: '💰' },
        { name: 'India Post', number: '1800-11-2011', category: 'Government', description: 'Postal services', icon: '📮' },
        { name: 'Passport Services', number: '1800-258-1800', category: 'Government', description: 'Passport seva services', icon: '📘' },
        { name: 'Railway Enquiry', number: '139', category: 'Government', description: 'Indian Railways information', icon: '🚂' },
        { name: 'EPFO (Pension)', number: '1800-118-005', category: 'Government', description: 'Employee provident fund', icon: '🏛️' },
        
        // Healthcare Services
        { name: 'Health Ministry', number: '1075', category: 'Healthcare', description: 'Ministry of Health helpline', icon: '🏥' },
        { name: 'Mental Health Helpline', number: '08046110007', category: 'Healthcare', description: 'Mental health support', icon: '🧠' },
        { name: 'COVID-19 Helpline', number: '1075', category: 'Healthcare', description: 'COVID-19 information', icon: '🦠' },
        
        // Consumer Services
        { name: 'Consumer Helpline', number: '1915', category: 'Consumer', description: 'Consumer protection', icon: '🛡️' },
        { name: 'LPG Gas Booking', number: '7718955555', category: 'Consumer', description: 'LPG cylinder booking', icon: '🔥' },
        
        // Transportation
        { name: 'Road Transport', number: '1033', category: 'Transportation', description: 'Road transport helpline', icon: '🚗' },
        { name: 'Indian Railways', number: '139', category: 'Transportation', description: 'Railway services', icon: '🚄' },
        
        // Utilities
        { name: 'Electricity Board', number: '1912', category: 'Utilities', description: 'Power outage complaints', icon: '⚡' }
      ]
    },
    'BR': {
      country: 'Brazil',
      flag: '🇧🇷',
      services: [
        // Emergency Services
        { name: 'Military Police', number: '190', category: 'Emergency', description: 'Military police emergency', icon: '👮' },
        { name: 'Fire Department', number: '193', category: 'Emergency', description: 'Fire department and rescue', icon: '🚒' },
        { name: 'Medical Emergency (SAMU)', number: '192', category: 'Emergency', description: 'Mobile emergency medical service', icon: '🚑' },
        { name: 'Civil Police', number: '197', category: 'Emergency', description: 'Civil police', icon: '👮' },
        { name: 'Highway Police', number: '191', category: 'Emergency', description: 'Federal highway police', icon: '🚨' },
        { name: 'Violence Against Women', number: '180', category: 'Emergency', description: 'Central de Atendimento à Mulher', icon: '👩' },
        { name: 'Child and Adolescent', number: '100', category: 'Emergency', description: 'Disque Direitos Humanos', icon: '👶' },
        { name: 'Elderly Abuse', number: '100', category: 'Emergency', description: 'Elder abuse reporting', icon: '👴' },
        
        // Government Services
        { name: 'Receita Federal (Tax)', number: '146', category: 'Government', description: 'Federal tax services', icon: '💰' },
        { name: 'Correios (Post)', number: '3003-0100', category: 'Government', description: 'Brazilian postal service', icon: '📮' },
        { name: 'Social Security (INSS)', number: '135', category: 'Government', description: 'National social security', icon: '🏛️' },
        { name: 'Federal Police', number: '194', category: 'Government', description: 'Federal police services', icon: '🛂' },
        { name: 'Labor Ministry', number: '158', category: 'Government', description: 'Labor rights and employment', icon: '💼' },
        
        // Healthcare Services
        { name: 'Health Ministry (SUS)', number: '136', category: 'Healthcare', description: 'Unified health system', icon: '🏥' },
        { name: 'Mental Health Support', number: '188', category: 'Healthcare', description: 'Centro de Valorização da Vida', icon: '🧠' },
        { name: 'Drug Abuse Help', number: '132', category: 'Healthcare', description: 'Drug and alcohol support', icon: '💊' },
        
        // Consumer Services
        { name: 'Consumer Defense', number: '151', category: 'Consumer', description: 'Procon consumer protection', icon: '🛡️' },
        { name: 'ANATEL (Telecom)', number: '1331', category: 'Consumer', description: 'Telecommunications complaints', icon: '📱' },
        
        // Transportation
        { name: 'ANTT (Transport)', number: '166', category: 'Transportation', description: 'Land transport agency', icon: '🚗' },
        
        // Utilities
        { name: 'ANEEL (Electricity)', number: '167', category: 'Utilities', description: 'Electric energy complaints', icon: '⚡' }
      ]
    },
    'ES': {
      country: 'Spain',
      flag: '🇪🇸',
      services: [
        // Emergency Services
        { name: 'Emergency Services', number: '112', category: 'Emergency', description: '24/7 emergency response', icon: '🚨' },
        { name: 'National Police', number: '091', category: 'Emergency', description: 'National police', icon: '👮' },
        { name: 'Local Police', number: '092', category: 'Emergency', description: 'Local police services', icon: '👮' },
        { name: 'Civil Guard', number: '062', category: 'Emergency', description: 'Guardia Civil', icon: '👮' },
        { name: 'Suicide Prevention', number: '717-003-717', category: 'Emergency', description: 'Teléfono de la Esperanza', icon: '💙' },
        { name: 'Gender Violence', number: '016', category: 'Emergency', description: 'Violence against women helpline', icon: '👩' },
        
        // Government Services
        { name: 'Tax Agency (AEAT)', number: '901-200-345', category: 'Government', description: 'Agencia Tributaria', icon: '💰' },
        { name: 'Correos (Post)', number: '902-197-197', category: 'Government', description: 'Spanish postal service', icon: '📮' },
        { name: 'Social Security', number: '901-166-565', category: 'Government', description: 'Seguridad Social', icon: '🏛️' },
        { name: 'Immigration Office', number: '060', category: 'Government', description: 'Immigration services', icon: '🛂' },
        { name: 'SEPE (Employment)', number: '901-119-999', category: 'Government', description: 'Public employment service', icon: '💼' },
        
        // Healthcare Services
        { name: 'Health Ministry', number: '901-400-100', category: 'Healthcare', description: 'Ministry of Health', icon: '🏥' },
        { name: 'Mental Health', number: '717-003-717', category: 'Healthcare', description: 'Mental health support', icon: '🧠' },
        { name: 'Drug Information', number: '900-161-515', category: 'Healthcare', description: 'Drug abuse information', icon: '💊' },
        
        // Consumer Services
        { name: 'Consumer Protection', number: '060', category: 'Consumer', description: 'Consumer rights', icon: '🛡️' },
        { name: 'CNMC (Competition)', number: '901-109-069', category: 'Consumer', description: 'Markets and Competition', icon: '⭐' },
        
        // Transportation
        { name: 'DGT (Traffic)', number: '060', category: 'Transportation', description: 'Traffic directorate', icon: '🚗' },
        { name: 'RENFE (Railway)', number: '912-320-320', category: 'Transportation', description: 'Spanish railways', icon: '🚄' },
        
        // Utilities
        { name: 'CNMC (Energy)', number: '901-109-069', category: 'Utilities', description: 'Energy market complaints', icon: '⚡' }
      ]
    }
  };

  useEffect(() => {
    filterServices();
  }, [searchTerm, selectedCategory, selectedCountry]);

  const filterServices = () => {
    const countryServices = serviceNumbers[selectedCountry]?.services || [];
    let filtered = countryServices;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(service => service.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(service => 
        service.name.toLowerCase().includes(term) ||
        service.description.toLowerCase().includes(term) ||
        service.number.includes(term)
      );
    }

    setFilteredServices(filtered);
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(id);
      setTimeout(() => setCopied(''), 2000);
    });
  };

  const categories = [...new Set(
    Object.values(serviceNumbers).flatMap(country => 
      country.services.map(service => service.category)
    )
  )].sort();

  const countries = Object.keys(serviceNumbers).sort((a, b) => {
    // Put major countries first in logical order
    const order = ['US', 'CN', 'JP', 'IN', 'GB', 'DE', 'FR', 'ES', 'CA', 'AU', 'KR', 'BR'];
    const aIndex = order.indexOf(a);
    const bIndex = order.indexOf(b);
    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    return a.localeCompare(b);
  });
  const currentCountryData = serviceNumbers[selectedCountry];

  const getEmergencyNumbers = () => {
    return currentCountryData?.services.filter(service => 
      service.category === 'Emergency'
    ).slice(0, 4) || [];
  };

  const getCategoryCounts = () => {
    const counts = {};
    currentCountryData?.services.forEach(service => {
      counts[service.category] = (counts[service.category] || 0) + 1;
    });
    return counts;
  };

  return (
    <div className="tool-container">
        {/* Country Selection */}
        <div className="country-selection-section">
          <h3>🌍 Select Country/Region</h3>
          <div className="country-selector">
            {countries.map(countryCode => {
              const country = serviceNumbers[countryCode];
              return (
                <button
                  key={countryCode}
                  type="button"
                  className={`country-button ${selectedCountry === countryCode ? 'active' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setSelectedCountry(countryCode);
                    // Reset search and category when switching countries
                    setSearchTerm('');
                    setSelectedCategory('all');
                  }}
                >
                  <span className="country-flag-large">{country.flag}</span>
                  <span className="country-name">{country.country}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Emergency Numbers Quick Access */}
        <div className="emergency-quick-section">
          <h3>🚨 Emergency Numbers - {currentCountryData?.country}</h3>
          <div className="emergency-grid">
            {getEmergencyNumbers().map((service, index) => (
              <div key={`emergency-${index}`} className="emergency-card">
                <div className="emergency-icon">{service.icon}</div>
                <div className="emergency-info">
                  <h4 className="emergency-name">{service.name}</h4>
                  <div className="emergency-number">{service.number}</div>
                  <p className="emergency-description">{service.description}</p>
                </div>
                <button 
                  className="btn btn-emergency"
                  onClick={() => copyToClipboard(service.number, `emergency-${index}`)}
                >
                  {copied === `emergency-${index}` ? '✓' : '📋'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="search-section">
          <div className="search-controls">
            <div className="input-group">
              <label className="input-label">Search services</label>
              <input
                type="text"
                className="text-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by service name, description, or number..."
              />
            </div>

            <div className="input-group">
              <label className="input-label">Filter by Category</label>
              <select
                className="text-input"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Categories ({currentCountryData?.services.length || 0})</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category} ({getCategoryCounts()[category] || 0})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Services Results */}
        <div className="results-section">
          <h3>📋 Services ({filteredServices.length} found)</h3>
          
          {filteredServices.length === 0 ? (
            <div className="no-results">
              <p>No services found matching your criteria.</p>
              <p>Try searching with different terms or select a different category.</p>
            </div>
          ) : (
            <div className="services-grid">
              {filteredServices.map((service, index) => (
                <div key={`service-${index}`} className="service-card">
                  <div className="service-header">
                    <div className="service-icon">{service.icon}</div>
                    <div className="service-info">
                      <h4 className="service-name">{service.name}</h4>
                      <span className="service-category">{service.category}</span>
                    </div>
                  </div>
                  
                  <div className="service-content">
                    <div className="service-number">{service.number}</div>
                    <p className="service-description">{service.description}</p>
                    
                    <div className="service-actions">
                      <button 
                        className="btn btn-outline btn-small"
                        onClick={() => copyToClipboard(service.number, `service-${index}`)}
                      >
                        {copied === `service-${index}` ? '✓ Copied!' : '📋 Copy Number'}
                      </button>
                      <a 
                        href={`tel:${service.number.replace(/[^\d+]/g, '')}`}
                        className="btn btn-primary btn-small"
                      >
                        📞 Call Now
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Usage Information */}
        <div className="usage-info">
          <h3>📖 Important Information</h3>
          <div className="usage-grid">
            <div className="usage-item">
              <h4>🚨 Emergency Services</h4>
              <p>Only call emergency numbers for life-threatening situations or crimes in progress. For non-emergencies, use the appropriate non-emergency numbers listed.</p>
            </div>
            
            <div className="usage-item">
              <h4>📱 Mobile Calling</h4>
              <p>Most numbers work from mobile phones. Some toll-free numbers may not work from certain carriers or when calling internationally.</p>
            </div>
            
            <div className="usage-item">
              <h4>🕒 Operating Hours</h4>
              <p>Emergency numbers operate 24/7. Government and public services typically operate during business hours. Check specific service websites for exact hours.</p>
            </div>
            
            <div className="usage-item">
              <h4>💡 Tips</h4>
              <ul>
                <li>Save important numbers in your phone contacts</li>
                <li>Keep emergency numbers accessible offline</li>
                <li>Have your location ready when calling emergency services</li>
                <li>Some services offer online alternatives</li>
              </ul>
            </div>
          </div>
        </div>
    </div>
  );
};

export default PublicServiceNumbers;
