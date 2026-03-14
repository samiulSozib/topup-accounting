import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'ps' | 'fa';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  isRTL: boolean;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    appName: 'TopUpHub',
    home: 'Home',
    transactions: 'Transactions',
    suppliers: 'Suppliers',
    resellers: 'Resellers',
    reports: 'Reports',
    login: 'Login',
    register: 'Register',
    forgotPassword: 'Forgot Password',
    totalBalance: 'Total Balance',
    supplierDue: 'Supplier Due',
    resellerDue: 'Reseller Due',
    todayProfit: "Today's Profit",
    buyTopup: 'Buy Topup',
    sellTopup: 'Sell Topup',
    supplierPayment: 'Supplier Payment',
    resellerPayment: 'Reseller Payment',
    addSupplier: 'Add Supplier',
    addReseller: 'Add Reseller',
    recentTransactions: 'Recent Transactions',
    quickActions: 'Quick Actions',
    supplierName: 'Supplier Name',
    company: 'Company',
    phone: 'Phone',
    bonusPercentage: 'Bonus %',
    status: 'Status',
    active: 'Active',
    inactive: 'Inactive',
    view: 'View',
    edit: 'Edit',
    disable: 'Disable',
    resellerName: 'Reseller Name',
    city: 'City',
    creditLimit: 'Credit Limit',
    baseAmount: 'Base Amount',
    referenceNumber: 'Reference Number',
    notes: 'Notes',
    totalTopup: 'Total Topup',
    bonus: 'Bonus',
    calculate: 'Calculate',
    submit: 'Submit',
    partyName: 'Party Name',
    transactionType: 'Transaction Type',
    debit: 'Debit',
    credit: 'Credit',
    balance: 'Balance',
    date: 'Date',
    all: 'All',
    purchases: 'Purchases',
    sales: 'Sales',
    payments: 'Payments',
    search: 'Search...',
    totalPurchased: 'Total Purchased',
    totalPaid: 'Total Paid',
    totalSold: 'Total Sold',
    totalReceived: 'Total Received',
    monthlyPurchase: 'Monthly Purchase',
    monthlySales: 'Monthly Sales',
    monthlyProfit: 'Monthly Profit',
    name: 'Name',
    businessName: 'Business Name',
    password: 'Password',
    phoneOrEmail: 'Phone or Email',
    createAccount: 'Create Account',
    signIn: 'Sign In',
    resetPassword: 'Reset Password',
    sendResetLink: 'Send Reset Link',
    alreadyHaveAccount: 'Already have an account?',
    dontHaveAccount: "Don't have an account?",
    forgotPasswordQ: 'Forgot password?',
    supplierLedger: 'Supplier Ledger',
    resellerLedger: 'Reseller Ledger',
    selectSupplier: 'Select Supplier',
    selectReseller: 'Select Reseller',
    companyName: 'Company Name',
    liveCalculation: 'Live Calculation',
    welcomeBack: 'Welcome back',
    manageYourBusiness: 'Manage your wholesale top-up business',
    phoneRequired: 'Phone number or email is required',
    passwordRequired: 'Password is required',
    loginSuccess: 'Login successful!',
    signingIn: 'Signing in...',
    logout: 'Logout',
    profile: 'Profile',
    settings: 'Settings',
    logoutSuccess: 'Logged out successfully',
    searchSuppliers: 'Search suppliers...',
    noSuppliers: 'No suppliers found',
    activate: 'Activate',
    delete: 'Delete',
    previous: 'Previous',
    next: 'Next',
    supplierActivated: 'Supplier activated successfully',
    supplierDeactivated: 'Supplier deactivated successfully',
    supplierDeleted: 'Supplier deleted successfully',
    statusUpdateFailed: 'Failed to update supplier status',
    deleteFailed: 'Failed to delete supplier',
    viewingSupplier: 'Viewing supplier details',
    nameRequired: 'Supplier name is required',
    supplierPhoneRequired: 'Phone number is required',
    companyRequired: 'Company name is required',
    bonusRequired: 'Bonus percentage is required',
    invalidBonus: 'Please enter a valid bonus percentage',
    supplierUpdated: 'Supplier updated successfully',
    supplierCreated: 'Supplier created successfully',
    operationFailed: 'Operation failed',
    editSupplier: 'Edit Supplier',
    phoneHint: 'Include country code e.g. +93',
    bonusHint: 'Percentage of bonus on each purchase',
    cancel: 'Cancel',
    saving: 'Saving...',
    pending: 'Pending',
    updateBonus: 'Update %',
    updateBonusPercentage: 'Update Bonus Percentage',
    percentageUpdated: 'Bonus percentage updated successfully',
    updateFailed: 'Failed to update bonus percentage',
    updating: 'Updating...',
    update: 'Update',
    searchResellers: 'Search resellers...',
    noResellers: 'No resellers found',
    resellerActivated: 'Reseller activated successfully',
    resellerDeactivated: 'Reseller deactivated successfully',
    resellerDeleted: 'Reseller deleted successfully',
    viewingReseller: 'Viewing reseller details',
    cityRequired: 'City is required',
    resellerUpdated: 'Reseller updated successfully',
    resellerCreated: 'Reseller created successfully',
    editReseller: 'Edit Reseller',
    selectSupplierRequired: 'Please select a supplier',
    selectResellerRequired: 'Please select a reseller',
    validAmountRequired: 'Please enter a valid amount',
    topupPurchased: 'Topup purchased successfully',
    topupSold: 'Topup sold successfully',
    processing: 'Processing...',
    discount: 'Discount',
    finalAmount: 'Final Amount',
    referencePlaceholder: 'Enter reference number (optional)',
    notesPlaceholder: 'Enter notes (optional)',
    paidAmount: 'Paid Amount',
    paidAmountHint: 'Amount paid now (optional)',
    dueAmount: 'Due Amount',
    paid: 'Paid',
    checkingStock: 'Checking stock...',
    availableStock: 'Available Stock',
    insufficientStock: 'Insufficient stock! Available: {stock}',
    stockCheckFailed: 'Failed to check stock',
    stockWarning: '⚠️ Insufficient stock for this sale',
    stockSufficient: '✅ Stock remaining after sale: {remaining}',
    noTransactions: 'No transactions found',
    loading: 'Loading...',
    viewAll: 'View All',





    validPaidAmountRequired: 'Please enter a valid paid amount',
    paidExceedsTotal: 'Paid amount cannot exceed total topup amount',
    amountExceedsStock: 'Amount exceeds available stock ({stock})',

    baseAmountHint: 'This is the amount you pay to supplier',

    maxPossibleBase: 'Max possible',


    paidNow: 'Paid Now',
    dueToSupplier: 'Due to Supplier',
    dueFromReseller: 'Due from Reseller',


    exceedsStock: 'Exceeds stock!',
    insufficientStockWarning: 'Insufficient stock for this sale',
    stockAfterSale: 'Stock after sale',
    maxAmount: 'Max amount',

    confirmPurchase: 'Confirm Purchase',
    confirmSale: 'Confirm Sale',

    payDue: 'Pay Due',
    paymentAmount: 'Payment Amount',
    confirmPayment: 'Confirm Payment',
    paymentSuccessful: 'Payment recorded successfully',
    paymentFailed: 'Payment failed',
    paymentExceedsDue: 'Payment cannot exceed due amount ({due})',
    action: 'Action',
    pay: 'Pay',
    collectDue: 'Collect Due',
    collectionAmount: 'Collection Amount',
    confirmCollection: 'Confirm Collection',
    collectionSuccessful: 'Payment collected successfully',
    collectionFailed: 'Collection failed',
    collectionExceedsDue: 'Collection cannot exceed due amount ({due})',
    collect: 'Collect',
    dashboard: 'Dashboard',
    loadingDashboard: 'Loading Dashboard',
    pleaseWait: 'Please wait...',
    totalStock: 'Total Stock',

    profit: 'Profit',
    loss: 'Loss',
    ofTotal: 'of total',
    highDue: 'High Due',
    units: 'units',
    unitsRemaining: 'units remaining',
    due: 'due',
    collections: 'collections',
    today: 'Today',
    week: 'Week',
    month: 'Month',
    thisWeek: 'This Week',
    thisMonth: 'This Month',
    revenue: 'Revenue',
    cost: 'Cost',
    profitMargin: 'Profit Margin',
    netBonus: 'Net Bonus',
    overall: 'Overall',
    stockUtilization: 'Stock Utilization',
    collectionRate: 'Collection Rate',
    todayActivity: "Today's Activity",

    dailyTarget: 'Daily Target',
    showLess: 'Show Less',
    showAll: 'Show All',
    alerts: 'Alerts',
    quickStats: 'Quick Stats',
    activeSuppliers: 'Active Suppliers',
    activeResellers: 'Active Resellers',
    totalTransactions: 'Total Transactions',
    avgTransaction: 'Avg Transaction',
    viewFullReport: 'View Full Report',

    justNow: 'Just now',
    m: 'm',
    h: 'h',
    d: 'd',

    // Alert Messages
    highSupplierDue: 'High Supplier Due',
    highResellerDue: 'High Reseller Due',
    lowStock: 'Low Stock',
    allGood: 'All Good',
    noAlerts: 'No alerts at this time',
    payNow: 'Pay Now',
    collectNow: 'Collect Now',
    restockNow: 'Restock Now',

    // Quick Action Descriptions
    purchaseFromSupplier: 'Purchase topup from supplier',
    sellToReseller: 'Sell topup to reseller',
    payToSupplier: 'Make payment to supplier',
    collectFromReseller: 'Collect payment from reseller',
    registerNewSupplier: 'Register a new supplier',
    registerNewReseller: 'Register a new reseller',
    viewDetailedReports: 'View detailed business reports',
    businessAnalytics: 'Business analytics and insights',




    // Performance Overview
    performanceOverview: 'Performance Overview',
    totalRevenue: 'Total Revenue',
    totalCost: 'Total Cost',





    analytics: 'Analytics',





    purchase: 'Purchase',
    sale: 'Sale',


    months: 'months',
    export: 'Export',
    period: 'Period',
    chartType: 'Chart Type',
    metrics: 'Metrics',
    year: 'Year',
    compareWithPreviousYear: 'Compare with previous year',
    comparisonYear: 'Comparison Year',
    lastWeek: 'Last Week',
    lastQuarter: 'Last Quarter',
    custom: 'Custom',
    monthlyPerformance: 'Monthly Performance',
    topSuppliers: 'Top Suppliers',
    topResellers: 'Top Resellers',
    dailyBreakdown: 'Daily Breakdown',
    avgPurchase: 'Avg Purchase',
    avgSale: 'Avg Sale',
    totalBonusGiven: 'Total Bonus Given',
    totalBonusReceived: 'Total Bonus Received',

    // Chart types
    bar: 'Bar',
    line: 'Line',
    area: 'Area',
    composed: 'Composed',

    // Metrics


    // Time periods

    quarter: 'Quarter',

    // Statistics

    totalProfit: 'Total Profit',

    // Bonus related

    // Messages
    noData: 'No data available',
    noDataForPeriod: 'No data available for this period',
    exportSuccess: 'Export successful',
    exportFailed: 'Export failed',

    // Additional
    viewDetails: 'View Details',
    downloadReport: 'Download Report',
    printReport: 'Print Report',
    filters: 'Filters',
    refresh: 'Refresh',
    applyFilters: 'Apply Filters',
    clearFilters: 'Clear Filters',
    dateRange: 'Date Range',
    startDate: 'Start Date',
    endDate: 'End Date',
    selectPeriod: 'Select Period',
    showComparison: 'Show Comparison',
    hideComparison: 'Hide Comparison',
    previousYear: 'Previous Year',
    currentYear: 'Current Year',
    growth: 'Growth',
    vsLastYear: 'vs Last Year',

    // Performance indicators
    highestPerforming: 'Highest Performing',
    lowestPerforming: 'Lowest Performing',
    averageTransaction: 'Average Transaction',
    totalBonusImpact: 'Total Bonus Impact',
    netProfit: 'Net Profit',
    grossProfit: 'Gross Profit',

    // Supplier/Reseller stats
    totalPurchases: 'Total Purchases',
    totalSales: 'Total Sales',
    transactionCount: 'Transaction Count',
    lastTransaction: 'Last Transaction',
    avgTransactionValue: 'Avg Transaction Value',

    // Chart labels
    amount: 'Amount',
    value: 'Value',

    // Tooltips
    clickToViewDetails: 'Click to view details',
    doubleClickToZoom: 'Double click to zoom',
    dragToSelect: 'Drag to select range',

    // Export options
    exportAsCSV: 'Export as CSV',
    exportAsPDF: 'Export as PDF',
    exportAsExcel: 'Export as Excel',
    sendByEmail: 'Send by Email',

    // Fullscreen
    enterFullscreen: 'Enter Fullscreen',
    exitFullscreen: 'Exit Fullscreen',


    completed: 'Completed',

    // Trends
    increasing: 'Increasing',
    decreasing: 'Decreasing',
    stable: 'Stable',
    volatile: 'Volatile',

    // Insights
    insights: 'Insights',
    topPerformer: 'Top Performer',
    needsAttention: 'Needs Attention',
    onTrack: 'On Track',
    behindTarget: 'Behind Target',

    // Month Names
    january: 'January',
    february: 'February',
    march: 'March',
    april: 'April',
    may: 'May',
    june: 'June',
    july: 'July',
    august: 'August',
    september: 'September',
    october: 'October',
    november: 'November',
    december: 'December',

    // Short Month Names (if needed)
    jan: 'Jan',
    feb: 'Feb',
    mar: 'Mar',
    apr: 'Apr',
    jun: 'Jun',
    jul: 'Jul',
    aug: 'Aug',
    sep: 'Sep',
    oct: 'Oct',
    nov: 'Nov',
    dec: 'Dec',
    searchTransactions: 'Search transactions...',
    clear: 'Clear',
    minAmount: 'Min Amount',
    totalBaseAmount: 'Total Base',
    totalBonus: 'Total Bonus',

    partial: 'Partial',
    totalDue: 'Total Due',


    totalAmount: 'Total',

    totalSuppliers: 'Total Suppliers',

    supplier: 'Supplier',
    contact: 'Contact',

    actions: 'Actions',





    currentStock: 'Current Stock',

    // Add/Edit Supplier Page
    addSupplierDescription: 'Add a new supplier to your network',
    editSupplierDescription: 'Update supplier information',
    supplierNamePlaceholder: 'Enter supplier name',
    phonePlaceholder: 'Enter phone number',

    companyNamePlaceholder: 'Enter company name',



    invalidPhone: 'Please enter a valid phone number',

    bonusMaxExceeded: 'Bonus percentage cannot exceed 100%',


    paymentAmountPlaceholder: 'Enter payment amount',


    selectSupplierPlaceholder: 'Choose a supplier',




    // Buttons
    buy: 'Buy',


    email: 'Email',
    address: 'Address',

    total: 'Total',

    time: 'Time',

    // Supplier Info in Modal
    supplierInfo: 'Supplier Information',


    // Form Labels
    enterBaseAmount: 'Enter base amount',
    enterPaidAmount: 'Enter paid amount (optional)',
    enterReference: 'Enter reference number',
    enterNotes: 'Enter notes',

    // Tooltips
    clickToSelect: 'Click to select supplier',
    remainingDue: 'Remaining due after purchase',

    // Confirmation
    confirmPurchaseMessage: 'Are you sure you want to purchase this topup?',
    purchaseSummary: 'Purchase Summary',
    transactionDate: 'Transaction Date',

    // Success Messages
    purchaseCompleted: 'Purchase completed successfully',
    purchaseFailed: 'Purchase failed. Please try again.',

    // Loading States
    calculating: 'Calculating...',
    submitting: 'Submitting...',

    // Error States
    errorOccurred: 'An error occurred',
    networkError: 'Network error. Please check your connection.',
    invalidData: 'Invalid data provided',
    since: 'Since',
    totalBuy: 'Total Buy',
    withBonus: 'With Bonus',
    stock: 'Stock',
    paymentRatio: 'Payment Ratio',
    bonusReceived: 'Bonus Received',
    created: 'Created',

    // Additional Terms
    gridView: 'Grid View',
    listView: 'List View',

    lastUpdated: 'Last Updated',
    joined: 'Joined',
    memberSince: 'Member Since',

    // Stats Labels
    buyStats: 'Purchase Statistics',
    paymentStats: 'Payment Statistics',
    bonusStats: 'Bonus Statistics',
    stockStats: 'Stock Statistics',

    // Compact number suffixes (already have these but ensuring)
    thousand: 'K',
    lakh: 'L',
    crore: 'Cr',
    million: 'M',
    billion: 'B',
    totalResellers: 'Total Resellers',

    reseller: 'Reseller',

    received: 'Received',

    sell: 'Sell',





    bonusGiven: 'Bonus Given',
    collectionRatio: 'Collection Ratio',



    // Add/Edit Reseller Page
    addResellerDescription: 'Add a new reseller to your network',
    editResellerDescription: 'Update reseller information',
    resellerNamePlaceholder: 'Enter reseller name',

    cityPlaceholder: 'Enter city name',



    selectResellerPlaceholder: 'Choose a reseller',









    // Stats Labels
    salesStats: 'Sales Statistics',


    resellerNotFound: 'Reseller Not Found',
    resellerNotFoundDesc: 'The reseller you are looking for does not exist or has been removed.',
    backToResellers: 'Back to Resellers',
    overview: 'Overview',
    contactInformation: 'Contact Information',
    salesSummary: 'Sales Summary',
    paymentSummary: 'Payment Summary',
    transactionHistory: 'Transaction History',

    average: 'Average',
    vsLastMonth: 'vs last month',
    supplierBreakdown: 'Supplier Breakdown',
    dailySummary: 'Daily Summary',
    summary: 'Summary',


    // Additional Stats
    totalWithBonus: 'Total with Bonus',

    supplierNotFound: 'Supplier Not Found',
    supplierNotFoundDesc: 'The supplier you are looking for does not exist or has been removed.',
    backToSuppliers: 'Back to Suppliers',

    stockInformation: 'Stock Information',

    recentActivity: 'Recent Activity',
    purchaseHistory: 'Purchase History',

    stockValue: 'Stock Value',
    avgPurchasePrice: 'Avg. Purchase Price',
    lastPurchase: 'Last Purchase',
    worth: 'worth',
    none: 'None',


    payment: 'Payment',
    subscriptionPackages: 'Subscription Packages',
    choosePackageDescription: 'Choose the perfect package for your business needs',
    totalPackages: 'Total Packages',
    webPackages: 'Web Packages',
    mobilePackages: 'Mobile Packages',
    featuredPackages: 'Featured',
    allPackages: 'All Packages',
    featured: 'Featured',
    webOnly: 'Web Only',
    mobileOnly: 'Mobile Only',
    bothPlatforms: 'Both Platforms',
    advancedFilters: 'Advanced Filters',
    priceRange: 'Price Range',
    duration: 'Duration',
    allDurations: 'All Durations',
    yearly: 'Yearly',
    webAccess: 'Web Access',
    mobileAccess: 'Mobile Access',
    fullSupport: '24/7 Support',
    updatesIncluded: 'Free Updates',
    buyNow: 'Buy Now',
    noPackagesFound: 'No Packages Found',
    noPackagesDescription: 'No packages match your current filters. Try adjusting your criteria.',

    // Package Features
    package: 'Package',
    price: 'Price',
    paymentMethod: 'Payment Method',

    // Buy Package Modal
    buyPackage: 'Buy Package',
    personalInformation: 'Personal Information',
    selectPaymentMethod: 'Select Payment Method',
    fullName: 'Full Name',
    enterFullName: 'Enter your full name',
    enterBusinessName: 'Enter your business name (optional)',
    phoneNumber: 'Phone Number',
    enterPhoneNumber: 'Enter your phone number',
    enterEmail: 'Enter your email address',
    enterAddress: 'Enter your street address',
    enterCity: 'Enter your city',
    additionalNotes: 'Additional Notes',
    acceptTerms: 'I accept the',
    termsAndConditions: 'Terms and Conditions',
    confirmMessage: 'Please review your information before confirming. You will receive a confirmation email with payment instructions.',
    back: 'Back',


    // Validation Messages
    fullNameRequired: 'Full name is required',

    invalidEmail: 'Please enter a valid email address',
    addressRequired: 'Address is required',
    paymentMethodRequired: 'Please select a payment method',
    termsRequired: 'You must accept the terms and conditions',

    // Success Messages
    purchaseSuccessful: 'Purchase successful! You will receive a confirmation email shortly.',

    // Payment Methods
    bkash: 'bKash',
    nagad: 'Nagad',
    rocket: 'Rocket',
    bankTransfer: 'Bank Transfer',
    creditCard: 'Credit/Debit Card',
    cash: 'Cash',

    requestPackage: 'Request Package',
    fillYourDetails: 'Fill in your details to request this package',

    dateOfBirth: 'Date of Birth',
    optional: 'optional',

    submitRequest: 'Submit Request',
    requestInfoMessage: 'Our team will review your request and contact you within 24 hours.',

    // Success States
    requestSubmitted: 'Request Submitted!',
    requestSuccessMessage: 'Your package request has been submitted successfully. Our team will contact you soon.',
    requestDetails: 'Request Details',

    done: 'Done',


    emailRequired: 'Email address is required',

    months_plural: 'Months',


    // Error Messages (from API)
    packageNotFound: 'Package not found or not available',
    pendingRequestPhone: 'You already have a pending request with this phone number',
    pendingRequestEmail: 'You already have a pending request with this email',
    phoneAlreadyRegistered: 'This phone number is already registered as a business owner',
    emailAlreadyRegistered: 'This email is already registered as a business owner',
    validationError: 'Validation error: Please check your input',
    duplicateEntry: 'Duplicate entry found',
    invalidPackage: 'Invalid package ID',
    databaseError: 'Database connection error. Please try again later.',
    serverError: 'An unexpected error occurred. Please try again later.',
    noResponse: 'No response from server. Please check your connection.',
    web: 'Web',
    mobile: 'Mobile',
    min: 'Min',
    max: 'Max',
  viewPackages: 'View Packages',


  },
  ps: {
    appName: 'ټاپ اپ هب',
    home: 'کور',
    transactions: 'راکړه ورکړه',
    suppliers: 'عرضه کوونکي',
    resellers: 'بیا پلورونکي',
    reports: 'راپورونه',
    login: 'ننوتل',
    register: 'راجسټر',
    forgotPassword: 'پټنوم مو هیر شوی؟',
    totalBalance: 'ټول بیلانس',
    supplierDue: 'د عرضه کوونکي پور',
    resellerDue: 'د بیا پلورونکي پور',
    todayProfit: 'نن ورځ ګټه',
    buyTopup: 'ټاپ اپ واخلئ',
    sellTopup: 'ټاپ اپ وپلورئ',
    supplierPayment: 'عرضه کوونکي ته تادیه',
    resellerPayment: 'بیا پلورونکي ته تادیه',
    addSupplier: 'عرضه کوونکی اضافه کړئ',
    addReseller: 'بیا پلورونکی اضافه کړئ',
    recentTransactions: 'وروستي راکړه ورکړه',
    quickActions: 'چټکې کړنې',
    supplierName: 'د عرضه کوونکي نوم',
    company: 'شرکت',
    phone: 'تلیفون',
    bonusPercentage: 'بونس ٪',
    status: 'حالت',
    active: 'فعال',
    inactive: 'غیر فعال',
    view: 'لیدل',
    edit: 'سمون',
    disable: 'غیر فعالول',
    resellerName: 'د بیا پلورونکي نوم',
    city: 'ښار',
    creditLimit: 'د پور حد',
    baseAmount: 'اصلي مبلغ',
    referenceNumber: 'حواله نمبر',
    notes: 'یادښتونه',
    totalTopup: 'ټول ټاپ اپ',
    bonus: 'بونس',
    calculate: 'حساب',
    submit: 'ولیږئ',
    partyName: 'د ګوند نوم',
    transactionType: 'د راکړې ورکړې ډول',
    debit: 'پور',
    credit: 'جمع',
    balance: 'بیلانس',
    date: 'نیټه',
    all: 'ټول',
    purchases: 'خریدونه',
    sales: 'پلورنه',
    payments: 'تادیات',
    search: 'لټون...',
    totalPurchased: 'ټول خریدونه',
    totalPaid: 'ټول تادیه شوي',
    totalSold: 'ټول پلورل شوي',
    totalReceived: 'ټول ترلاسه شوي',
    monthlyPurchase: 'میاشتنۍ خریدونه',
    monthlySales: 'میاشتنۍ پلورنه',
    monthlyProfit: 'میاشتنۍ ګټه',
    name: 'نوم',
    businessName: 'د سوداګرۍ نوم',
    password: 'پټنوم',
    phoneOrEmail: 'تلیفون یا ایمیل',
    createAccount: 'حساب جوړ کړئ',
    signIn: 'ننوتل',
    resetPassword: 'پټنوم بیا تنظیم',
    sendResetLink: 'لینک ولیږئ',
    alreadyHaveAccount: 'حساب لرئ؟',
    dontHaveAccount: 'حساب نه لرئ؟',
    forgotPasswordQ: 'پټنوم مو هیر شوی؟',
    supplierLedger: 'د عرضه کوونکي کھاتہ',
    resellerLedger: 'د بیا پلورونکي کھاتہ',
    selectSupplier: 'عرضه کوونکی وټاکئ',
    selectReseller: 'بیا پلورونکی وټاکئ',
    companyName: 'د شرکت نوم',
    liveCalculation: 'ژوندی حساب',
    welcomeBack: 'بیرته ښه راغلاست',
    manageYourBusiness: 'خپله عمده ټاپ اپ سوداګري اداره کړئ',
    phoneRequired: 'تلیفون یا ایمیل اړین دی',
    passwordRequired: 'پټنوم اړین دی',
    loginSuccess: 'بریالی ننوتل!',
    signingIn: 'ننوتل روان دي...',
    logout: 'وتل',
    profile: 'پروفایل',
    settings: 'تنظیمات',
    logoutSuccess: 'بریالي وتل',
    searchSuppliers: 'عرضه کوونکي ولټوئ...',
    noSuppliers: 'هیڅ عرضه کوونکی ونه موندل شو',
    activate: 'فعالول',
    delete: 'ړنګول',
    previous: 'مخکینی',
    next: 'راتلونکی',
    supplierActivated: 'عرضه کوونکی په بریالیتوب سره فعال شو',
    supplierDeactivated: 'عرضه کوونکی په بریالیتوب سره غیر فعال شو',
    supplierDeleted: 'عرضه کوونکی په بریالیتوب سره ړنګ شو',
    statusUpdateFailed: 'د وضعیت تازه کول ناکام شول',
    deleteFailed: 'ړنګول ناکام شول',
    viewingSupplier: 'د عرضه کوونکی تفصیلات لیدل',
    nameRequired: 'د عرضه کوونکی نوم اړین دی',
    supplierPhoneRequired: 'د تلیفون شمیره اړینه ده',
    companyRequired: 'د شرکت نوم اړین دی',
    bonusRequired: 'د بونس فیصدي اړینه ده',
    invalidBonus: 'مهرباني وکړئ سمه بونس فیصدي دننه کړئ',
    supplierUpdated: 'عرضه کوونکی په بریالیتوب سره تازه شو',
    supplierCreated: 'عرضه کوونکی په بریالیتوب سره جوړ شو',
    operationFailed: 'عملیات ناکام شول',
    editSupplier: 'د عرضه کوونکی سمول',
    phoneHint: 'د هیواد کوډ شامل کړئ لکه +93',
    bonusHint: 'په هر پیرود کې د بونس فیصدي',
    cancel: 'لغوه',
    saving: 'خوندي کول...',
    pending: 'انتظار',
    updateBonus: 'بونس بدلول',
    updateBonusPercentage: 'د بونس فیصدي بدلول',
    percentageUpdated: 'د بونس فیصدي په بریالیتوب سره تازه شوه',
    updateFailed: 'د بونس فیصدي تازه کول ناکام شول',
    updating: 'تازه کول...',
    update: 'تازه کول',
    searchResellers: 'بیا پلورونکي ولټوئ...',
    noResellers: 'هیڅ بیا پلورونکی ونه موندل شو',
    resellerActivated: 'بیا پلورونکی په بریالیتوب سره فعال شو',
    resellerDeactivated: 'بیا پلورونکی په بریالیتوب سره غیر فعال شو',
    resellerDeleted: 'بیا پلورونکی په بریالیتوب سره ړنګ شو',
    viewingReseller: 'د بیا پلورونکی تفصیلات لیدل',
    cityRequired: 'ښار اړین دی',
    resellerUpdated: 'بیا پلورونکی په بریالیتوب سره تازه شو',
    resellerCreated: 'بیا پلورونکی په بریالیتوب سره جوړ شو',
    editReseller: 'د بیا پلورونکی سمول',
    selectSupplierRequired: 'مهرباني وکړئ عرضه کوونکی وټاکئ',
    selectResellerRequired: 'مهرباني وکړئ بیا پلورونکی وټاکئ',
    validAmountRequired: 'مهرباني وکړئ سمه اندازه دننه کړئ',
    topupPurchased: 'ټاپ اپ په بریالیتوب سره وپلورل شو',
    topupSold: 'ټاپ اپ په بریالیتوب سره وپلورل شو',
    processing: 'پروسه کېږي...',
    discount: 'تخفیف',
    finalAmount: 'نهایی اندازه',
    referencePlaceholder: 'د حوالې نمبر دننه کړئ (اختیاري)',
    notesPlaceholder: 'یادښتونه دننه کړئ (اختیاري)',
    paidAmount: 'تادیه شوی مقدار',
    paidAmountHint: 'اوس تادیه شوی مقدار (اختیاري)',
    dueAmount: 'پاتې مقدار',
    paid: 'تادیه شوی',
    checkingStock: 'ستاک چک کول...',
    availableStock: 'موجوده ستاک',
    insufficientStock: 'کافي ستاک نشته! موجوده: {stock}',
    stockCheckFailed: 'ستاک چک کول ناکام شول',
    stockWarning: '⚠️ د پلور لپاره کافي ستاک نشته',
    stockSufficient: '✅ د پلور وروسته پاتې ستاک: {remaining}',
    noTransactions: 'هیڅ راکړه ورکړه ونه موندل شوه',
    loading: 'بار کول...',
    viewAll: 'ټول وګورئ',





    validPaidAmountRequired: 'مهرباني وکړئ سمه تادیه شوی اندازه دننه کړئ',
    paidExceedsTotal: 'تادیه شوی اندازه د ټول ټاپ اپ څخه زیات نشي کیدی',
    amountExceedsStock: 'اندازه د موجوده سټاک څخه زیاته ده ({stock})',

    // Hint Texts
    baseAmountHint: 'دا هغه اندازه ده چې تاسو عرضه کوونکي ته ورکوئ',

    maxPossibleBase: 'زیاته ممکنه اندازه',


    paidNow: 'اوس تادیه شوی',
    dueToSupplier: 'عرضه کوونکي ته پاتې',
    dueFromReseller: 'بیا پلورونکی پاتې دی',


    exceedsStock: 'له سټاک څخه زیات!',
    insufficientStockWarning: 'د دې پلور لپاره کافي سټاک نشته',
    stockAfterSale: 'د پلور وروسته سټاک',
    maxAmount: 'زیاته اندازه',

    confirmPurchase: 'خرید تایید کړئ',
    confirmSale: 'پلور تایید کړئ',
    payDue: 'پاتې پیسې ادا کړئ',
    paymentAmount: 'د تادیې مقدار',
    confirmPayment: 'تادیه تایید کړئ',
    paymentSuccessful: 'تادیه په بریالیتوب سره ثبت شوه',
    paymentFailed: 'تادیه ناکامه شوه',
    paymentExceedsDue: 'تادیه د پاتې پیسو څخه زیات نشي کیدی ({due})',
    action: 'عمل',
    pay: 'ادا کړئ',
    collectDue: 'پاتې پیسې راټول کړئ',
    collectionAmount: 'د راټولولو مقدار',
    confirmCollection: 'راټولول تایید کړئ',
    collectionSuccessful: 'تادیه په بریالیتوب سره راټوله شوه',
    collectionFailed: 'راټولول ناکام شو',
    collectionExceedsDue: 'راټولول د پاتې پیسو څخه زیات نشي کیدی ({due})',
    collect: 'راټول کړئ',
    dashboard: 'ډشبورډ',
    loadingDashboard: 'ډشبورډ باریدل',
    pleaseWait: 'مهرباني وکړئ انتظار وکړئ...',
    totalStock: 'ټول سټاک',

    profit: 'ګټه',
    loss: 'تاوان',
    ofTotal: 'د ټول',
    highDue: 'لوړ پور',
    units: 'واحدونه',
    unitsRemaining: 'پاتې واحدونه',
    due: 'پور',
    collections: 'راټولونه',
    today: 'نن',
    week: 'اونۍ',
    month: 'میاشت',
    thisWeek: 'دا اونۍ',
    thisMonth: 'دا میاشت',
    revenue: 'عواید',
    cost: 'لګښت',
    profitMargin: 'د ګټې کچه',
    netBonus: 'خالص بونس',
    overall: 'ټولیز',
    stockUtilization: 'د سټاک کارول',
    collectionRate: 'د راټولولو کچه',
    todayActivity: 'نن ورځ فعالیت',

    dailyTarget: 'ورځنی هدف',
    showLess: 'کم ښودل',
    showAll: 'ټول ښودل',
    alerts: 'خبرتیاوې',
    quickStats: 'چټک احصایې',
    activeSuppliers: 'فعال عرضه کوونکي',
    activeResellers: 'فعال بیا پلورونکي',
    totalTransactions: 'ټولې راکړې ورکړې',
    avgTransaction: 'اوسط راکړه ورکړه',
    viewFullReport: 'مکمل راپور وګورئ',

    justNow: 'اوس هم',
    m: 'م',
    h: 'س',
    d: 'و',

    // Alert Messages
    highSupplierDue: 'د عرضه کوونکي لوړ پور',
    highResellerDue: 'د بیا پلورونکي لوړ پور',
    lowStock: 'کم سټاک',
    allGood: 'ټول ښه',
    noAlerts: 'په دې وخت کې هیڅ خبرتیا نشته',
    payNow: 'اوس تادیه کړئ',
    collectNow: 'اوس راټول کړئ',
    restockNow: 'اوس سټاک ډک کړئ',

    // Quick Action Descriptions
    purchaseFromSupplier: 'د عرضه کوونکي څخه ټاپ اپ واخلئ',
    sellToReseller: 'بیا پلورونکي ته ټاپ اپ وپلورئ',
    payToSupplier: 'عرضه کوونکي ته تادیه وکړئ',
    collectFromReseller: 'د بیا پلورونکي څخه تادیه راټول کړئ',
    registerNewSupplier: 'نوی عرضه کوونکی ثبت کړئ',
    registerNewReseller: 'نوی بیا پلورونکی ثبت کړئ',
    viewDetailedReports: 'تفصيلي سوداګریز راپورونه وګورئ',
    businessAnalytics: 'سوداګریز تحلیلونه',

    // Performance Overview
    performanceOverview: 'د فعالیت کتنه',
    totalRevenue: 'ټول عواید',
    totalCost: 'ټول لګښت',

    // Quick Actions
    analytics: 'تحلیلونه',

    months: 'میاشتې',
    export: 'صادرول',
    period: 'موده',
    chartType: 'د چارټ ډول',
    metrics: 'میټریکونه',
    year: 'کال',
    compareWithPreviousYear: 'تیر کال سره پرتله کول',
    comparisonYear: 'د پرتله کولو کال',
    lastWeek: 'تیره اونۍ',
    lastQuarter: 'تیر ربع',
    custom: 'دلخواه',
    monthlyPerformance: 'میاشتنی فعالیت',
    topSuppliers: 'غوره عرضه کوونکي',
    topResellers: 'غوره بیا پلورونکي',
    dailyBreakdown: 'ورځنی تحلیل',
    avgPurchase: 'اوسط خرید',
    avgSale: 'اوسط پلور',
    totalBonusGiven: 'ټول ورکړل شوی بونس',
    totalBonusReceived: 'ټول ترلاسه شوی بونس',

    // Chart types
    bar: 'بار',
    line: 'کرښه',
    area: 'ساحه',
    composed: 'مرکب',

    // Metrics
    purchase: 'خرید',



    quarter: 'ربع',


    totalProfit: 'ټوله ګټه',


    // Messages
    noData: 'هیڅ معلومات شتون نلري',
    noDataForPeriod: 'د دې مودې لپاره هیڅ معلومات شتون نلري',
    exportSuccess: 'صادرول بریالي شول',
    exportFailed: 'صادرول ناکام شول',

    // Additional
    viewDetails: 'تفصیلات وګورئ',
    downloadReport: 'راپور ډاونلوډ کړئ',
    printReport: 'راپور چاپ کړئ',
    filters: 'فلټرونه',
    refresh: 'تازه کول',
    applyFilters: 'فلټرونه تطبیق کړئ',
    clearFilters: 'فلټرونه پاک کړئ',
    dateRange: 'د نیټې حد',
    startDate: 'پیل نیټه',
    endDate: 'پای نیټه',
    selectPeriod: 'موده وټاکئ',
    showComparison: 'پرتله ښودل',
    hideComparison: 'پرتله پټول',
    previousYear: 'تیر کال',
    currentYear: 'اوسنی کال',
    growth: 'وده',
    vsLastYear: 'د تیر کال په پرتله',

    // Performance indicators
    highestPerforming: 'غوره فعالیت',
    lowestPerforming: 'کمزوری فعالیت',
    averageTransaction: 'اوسط راکړه ورکړه',
    totalBonusImpact: 'ټول بونس اغیز',
    netProfit: 'خالص ګټه',
    grossProfit: 'ناخالص ګټه',

    // Supplier/Reseller stats
    totalPurchases: 'ټول خریدونه',
    totalSales: 'ټول پلور',
    transactionCount: 'د راکړو ورکړو شمیر',
    lastTransaction: 'وروستۍ راکړه ورکړه',
    avgTransactionValue: 'اوسط راکړه ورکړه ارزښت',

    // Chart labels
    amount: 'اندازه',
    value: 'ارزښت',

    // Tooltips
    clickToViewDetails: 'تفصیلاتو لیدو لپاره کلیک وکړئ',
    doubleClickToZoom: 'زوم کولو لپاره دوه ځله کلیک وکړئ',
    dragToSelect: 'حد ټاکلو لپاره کش کړئ',

    // Export options
    exportAsCSV: 'د CSV په توګه صادر کړئ',
    exportAsPDF: 'د PDF په توګه صادر کړئ',
    exportAsExcel: 'د Excel په توګه صادر کړئ',
    sendByEmail: 'بریښنالیک ولیږئ',

    // Fullscreen
    enterFullscreen: 'بشپړ سکرین ته لاړ شئ',
    exitFullscreen: 'بشپړ سکرین پریږدئ',


    completed: 'بشپړ شوی',

    // Trends
    increasing: 'زیاتیدونکی',
    decreasing: 'کمیدونکی',
    stable: 'باثباته',
    volatile: 'بې ثباته',

    // Insights
    insights: 'لیدونه',
    topPerformer: 'غوره ترسره کوونکی',
    needsAttention: 'پاملرنې ته اړتیا لري',
    onTrack: 'په لاره کې',
    behindTarget: 'له هدف وروسته',

    // Month Names
    january: 'جنوري',
    february: 'فبروري',
    march: 'مارچ',
    april: 'اپریل',
    may: 'می',
    june: 'جون',
    july: 'جولای',
    august: 'اګست',
    september: 'سپتمبر',
    october: 'اکتوبر',
    november: 'نومبر',
    december: 'دسمبر',

    // Short Month Names
    jan: 'جنوري',
    feb: 'فبروري',
    mar: 'مارچ',
    apr: 'اپریل',
    jun: 'جون',
    jul: 'جولای',
    aug: 'اګست',
    sep: 'سپتمبر',
    oct: 'اکتوبر',
    nov: 'نومبر',
    dec: 'دسمبر',
    searchTransactions: 'راکړه ورکړه لټون...',
    clear: 'پاکول',

    minAmount: 'لږ تر لږه اندازه',
    totalBaseAmount: 'ټول اساس',
    totalBonus: 'ټول بونس',



    sale: 'پلور',


    // Status
    partial: 'برخه ییز',
    totalDue: 'ټول پاتې',
    totalAmount: 'ټولټال',
    totalSuppliers: 'ټول عرضه کوونکي',

    supplier: 'عرضه کوونکی',
    contact: 'اړیکه',

    actions: 'کړنې',
    currentStock: 'اوسنی سټاک',
    // Add/Edit Supplier Page
    addSupplierDescription: 'خپل شبکې ته نوی عرضه کوونکی اضافه کړئ',
    editSupplierDescription: 'د عرضه کوونکی معلومات تازه کړئ',
    supplierNamePlaceholder: 'د عرضه کوونکی نوم دننه کړئ',
    phonePlaceholder: 'د تلیفون شمیره دننه کړئ',

    companyNamePlaceholder: 'د شرکت نوم دننه کړئ',



    invalidPhone: 'مهرباني وکړئ سمه تلیفون شمیره دننه کړئ',

    bonusMaxExceeded: 'د بونس فیصدي له 100٪ څخه زیات نشي کیدی',

    // Success Messages

    paymentAmountPlaceholder: 'د تادیې اندازه دننه کړئ',


    selectSupplierPlaceholder: 'یو عرضه کوونکی وټاکئ',






    // Buttons
    buy: 'خرید',

    email: 'بریښنالیک',
    address: 'پته',

    total: 'ټولټال',

    time: 'وخت',

    // Supplier Info in Modal
    supplierInfo: 'د عرضه کوونکی معلومات',


    // Form Labels
    enterBaseAmount: 'اساسي اندازه دننه کړئ',
    enterPaidAmount: 'د تادیې اندازه دننه کړئ (اختیاري)',
    enterReference: 'د حوالې نمبر دننه کړئ',
    enterNotes: 'یادښتونه دننه کړئ',

    // Tooltips
    clickToSelect: 'د عرضه کوونکی انتخابولو لپاره کلیک وکړئ',
    remainingDue: 'د خرید وروسته پاتې پور',

    // Confirmation
    confirmPurchaseMessage: 'آیا تاسو د دې ټاپ اپ خرید تایید کوئ؟',
    purchaseSummary: 'د خرید لنډیز',
    transactionDate: 'د راکړې ورکړې نیټه',

    // Success Messages
    purchaseCompleted: 'خرید په بریالیتوب سره بشپړ شو',
    purchaseFailed: 'خرید ناکام شو. مهرباني وکړئ بیا هڅه وکړئ.',

    // Loading States
    calculating: 'حساب کول...',
    submitting: 'سپارل...',

    // Error States
    errorOccurred: 'یوه تېروتنه رامنځته شوه',
    networkError: 'د شبکې تېروتنه. مهرباني وکړئ خپله اړیکه وګورئ.',
    invalidData: 'ناسم معلومات ورکړل شوي',
    since: 'له',
    totalBuy: 'ټول خرید',
    withBonus: 'د بونس سره',
    stock: 'سټاک',
    paymentRatio: 'د تادیې تناسب',
    bonusReceived: 'ترلاسه شوی بونس',
    created: 'جوړ شوی',

    // Additional Terms
    gridView: 'د ګریډ لید',
    listView: 'د لیست لید',

    lastUpdated: 'وروستی تازه',
    joined: 'شامل شوی',
    memberSince: 'غړی له',

    // Stats Labels
    buyStats: 'د خرید احصایې',
    paymentStats: 'د تادیې احصایې',
    bonusStats: 'د بونس احصایې',
    stockStats: 'د سټاک احصایې',

    // Compact number suffixes
    thousand: 'زره',
    lakh: 'لک',
    crore: 'کروړ',
    million: 'میلیون',
    billion: 'میلیارد',
    totalResellers: 'ټول بیا پلورونکي',

    reseller: 'بیا پلورونکی',

    received: 'ترلاسه شوی',

    sell: 'پلورل',





    bonusGiven: 'ورکړل شوی بونس',
    collectionRatio: 'د راټولولو تناسب',




    addResellerDescription: 'خپل شبکې ته نوی بیا پلورونکی اضافه کړئ',
    editResellerDescription: 'د بیا پلورونکی معلومات تازه کړئ',
    resellerNamePlaceholder: 'د بیا پلورونکی نوم دننه کړئ',

    cityPlaceholder: 'د ښار نوم دننه کړئ',






    selectResellerPlaceholder: 'یو بیا پلورونکی وټاکئ',

    // Stats Labels
    salesStats: 'د پلور احصایې',


    resellerNotFound: 'بیا پلورونکی ونه موندل شو',
    resellerNotFoundDesc: 'هغه بیا پلورونکی چې تاسو یې په لټه کې یاست شتون نلري یا لرې شوی دی.',
    backToResellers: 'بیا پلورونکو ته ورشئ',
    overview: 'کتنه',
    contactInformation: 'د اړیکو معلومات',
    salesSummary: 'د پلور لنډیز',
    paymentSummary: 'د تادیې لنډیز',
    transactionHistory: 'د راکړو ورکړو تاریخ',

    average: 'اوسط',
    vsLastMonth: 'د تیرې میاشتې په پرتله',
    supplierBreakdown: 'د عرضه کوونکو تحلیل',
    dailySummary: 'ورځنی لنډیز',
    summary: 'لنډیز',


    // Additional Stats
    totalWithBonus: 'ټول د بونس سره',
    supplierNotFound: 'عرضه کوونکی ونه موندل شو',
    supplierNotFoundDesc: 'هغه عرضه کوونکی چې تاسو یې په لټه کې یاست شتون نلري یا لرې شوی دی.',
    backToSuppliers: 'عرضه کوونکو ته ورشئ',

    stockInformation: 'د سټاک معلومات',

    recentActivity: 'وروستي فعالیت',
    purchaseHistory: 'د خرید تاریخ',

    stockValue: 'د سټاک ارزښت',
    avgPurchasePrice: 'اوسط خرید نرخ',
    lastPurchase: 'وروستی خرید',
    worth: 'ارزښت',
    none: 'هیڅ',


    payment: 'تادیه',

    subscriptionPackages: 'د ګډون بستې',
    choosePackageDescription: 'د خپل سوداګرۍ اړتیاو لپاره مناسبه بسته غوره کړئ',
    totalPackages: 'ټولې بستې',
    webPackages: 'ویب بستې',
    mobilePackages: 'موبایل بستې',
    featuredPackages: 'ځانګړې بستې',
    allPackages: 'ټولې بستې',
    featured: 'ځانګړې',
    webOnly: 'یوازې ویب',
    mobileOnly: 'یوازې موبایل',
    bothPlatforms: 'دواړه پلیټ فارمونه',
    advancedFilters: 'پرمختللي فلټرونه',
    priceRange: 'د بیې حد',
    duration: 'موده',
    allDurations: 'ټولې مودې',
    yearly: 'کلنۍ',
    webAccess: 'ویب لاسرسی',
    mobileAccess: 'موبایل لاسرسی',
    fullSupport: '۲۴/۷ ملاتړ',
    updatesIncluded: 'وړیا تازه معلومات',
    buyNow: 'اوس واخلئ',
    noPackagesFound: 'هیڅ بسته ونه موندل شوه',
    noPackagesDescription: 'ستاسو د اوسنیو فلټرونو سره هیڅ بسته سمون نه خوري. مهرباني وکړئ خپل معیارونه تنظیم کړئ.',

    // Package Features
    package: 'بسته',
    price: 'بیه',

    paymentMethod: 'د تادیې طریقه',

    // Buy Package Modal
    buyPackage: 'بسته واخلئ',
    personalInformation: 'شخصي معلومات',
    selectPaymentMethod: 'د تادیې طریقه وټاکئ',
    fullName: 'بشپړ نوم',
    enterFullName: 'خپل بشپړ نوم دننه کړئ',
    enterBusinessName: 'د خپل سوداګرۍ نوم دننه کړئ (اختیاري)',
    phoneNumber: 'د تلیفون شمېره',
    enterPhoneNumber: 'د خپل تلیفون شمېره دننه کړئ',
    enterEmail: 'د خپل بریښنالیک آدرس دننه کړئ',
    enterAddress: 'خپل پته دننه کړئ',
    enterCity: 'خپل ښار دننه کړئ',
    additionalNotes: 'اضافي یادښتونه',
    acceptTerms: 'زه منم',
    termsAndConditions: 'شرایط او احکام',
    confirmMessage: 'مهرباني وکړئ د تایید دمخه خپل معلومات وګورئ. تاسو به د تادیې لارښوونو سره یو تایید بریښنالیک ترلاسه کړئ.',
    back: 'شاته',


    // Validation Messages
    fullNameRequired: 'بشپړ نوم اړین دی',
    invalidEmail: 'مهرباني وکړئ یو سم بریښنالیک آدرس دننه کړئ',
    addressRequired: 'پته اړینه ده',
    paymentMethodRequired: 'مهرباني وکړئ د تادیې طریقه وټاکئ',
    termsRequired: 'تاسو باید شرایط او احکام ومنئ',

    // Success Messages
    purchaseSuccessful: 'خرید بریالی شو! تاسو به ژر تر ژره د تایید بریښنالیک ترلاسه کړئ.',

    // Payment Methods
    bkash: 'بیکاش',
    nagad: 'ناګاد',
    rocket: 'راکټ',
    bankTransfer: 'بانکي تحویل',
    creditCard: 'کریډیټ/ډیبټ کارډ',
    cash: 'نغدې',

    requestPackage: 'د بستې غوښتنه',
    fillYourDetails: 'د دې بستې غوښتنې لپاره خپل معلومات ډک کړئ',

    dateOfBirth: 'د زیږیدو نیټه',
    optional: 'اختیاري',

    submitRequest: 'غوښتنه وسپارئ',
    requestInfoMessage: 'زموږ ټیم به ستاسو غوښتنه وڅیړي او د ۲۴ ساعتونو په اوږدو کې به له تاسو سره اړیکه ونیسي.',

    // Success States
    requestSubmitted: 'غوښتنه وسپارل شوه!',
    requestSuccessMessage: 'ستاسو د بستې غوښتنه په بریالیتوب سره وسپارل شوه. زموږ ټیم به ژر له تاسو سره اړیکه ونیسي.',
    requestDetails: 'د غوښتنې جزیات',

    done: 'ترسره شو',

    // Validation Messages
    emailRequired: 'بریښنالیک آدرس اړین دی',

    // Package Details
    months_plural: 'میاشتې',


    // Error Messages (from API)
    packageNotFound: 'بسته ونه موندل شوه یا شتون نلري',
    pendingRequestPhone: 'تاسو دمخه د دې تلیفون شمیرې سره یوه غوښتنه لرئ',
    pendingRequestEmail: 'تاسو دمخه د دې بریښنالیک سره یوه غوښتنه لرئ',
    phoneAlreadyRegistered: 'دا د تلیفون شمېره دمخه د سوداګرۍ مالک په توګه ثبت شوې ده',
    emailAlreadyRegistered: 'دا بریښنالیک دمخه د سوداګرۍ مالک په توګه ثبت شوی دی',
    validationError: 'د اعتبار تېروتنه: مهرباني وکړئ خپل معلومات وګورئ',
    duplicateEntry: 'نقل شوی داخلیدل وموندل شو',
    invalidPackage: 'د بستې پېژندپاڼه ناسمه ده',
    databaseError: 'د ډیټابیس تېروتنه. مهرباني وکړئ وروسته بیا هڅه وکړئ.',
    serverError: 'یوه ناڅاپي تېروتنه رامنځته شوه. مهرباني وکړئ وروسته بیا هڅه وکړئ.',
    noResponse: 'له سرور څخه ځواب نشته. مهرباني وکړئ خپله اړیکه وګورئ.',

    web: 'ویب',
    mobile: 'موبایل',
    min: 'لږ تر لږه',
    max: 'زیاته',
  viewPackages: 'بستې وګورئ',


  },
  fa: {
    appName: 'تاپ آپ هاب',
    home: 'خانه',
    transactions: 'تراکنش‌ها',
    suppliers: 'تامین‌کنندگان',
    resellers: 'فروشندگان',
    reports: 'گزارش‌ها',
    login: 'ورود',
    register: 'ثبت نام',
    forgotPassword: 'رمز عبور را فراموش کردید؟',
    totalBalance: 'موجودی کل',
    supplierDue: 'بدهی تامین‌کننده',
    resellerDue: 'بدهی فروشنده',
    todayProfit: 'سود امروز',
    buyTopup: 'خرید شارژ',
    sellTopup: 'فروش شارژ',
    supplierPayment: 'پرداخت تامین‌کننده',
    resellerPayment: 'پرداخت فروشنده',
    addSupplier: 'افزودن تامین‌کننده',
    addReseller: 'افزودن فروشنده',
    recentTransactions: 'تراکنش‌های اخیر',
    quickActions: 'عملیات سریع',
    supplierName: 'نام تامین‌کننده',
    company: 'شرکت',
    phone: 'تلفن',
    bonusPercentage: 'درصد پاداش',
    status: 'وضعیت',
    active: 'فعال',
    inactive: 'غیرفعال',
    view: 'مشاهده',
    edit: 'ویرایش',
    disable: 'غیرفعال',
    resellerName: 'نام فروشنده',
    city: 'شهر',
    creditLimit: 'سقف اعتبار',
    baseAmount: 'مبلغ پایه',
    referenceNumber: 'شماره مرجع',
    notes: 'یادداشت',
    totalTopup: 'کل شارژ',
    bonus: 'پاداش',
    calculate: 'محاسبه',
    submit: 'ارسال',
    partyName: 'نام طرف',
    transactionType: 'نوع تراکنش',
    debit: 'بدهکار',
    credit: 'بستانکار',
    balance: 'موجودی',
    date: 'تاریخ',
    all: 'همه',
    purchases: 'خرید',
    sales: 'فروش',
    payments: 'پرداخت‌ها',
    search: 'جستجو...',
    totalPurchased: 'کل خرید',
    totalPaid: 'کل پرداخت',
    totalSold: 'کل فروش',
    totalReceived: 'کل دریافت',
    monthlyPurchase: 'خرید ماهانه',
    monthlySales: 'فروش ماهانه',
    monthlyProfit: 'سود ماهانه',
    name: 'نام',
    businessName: 'نام کسب و کار',
    password: 'رمز عبور',
    phoneOrEmail: 'تلفن یا ایمیل',
    createAccount: 'ایجاد حساب',
    signIn: 'ورود',
    resetPassword: 'بازنشانی رمز',
    sendResetLink: 'ارسال لینک',
    alreadyHaveAccount: 'حساب دارید؟',
    dontHaveAccount: 'حساب ندارید؟',
    forgotPasswordQ: 'رمز را فراموش کردید؟',
    supplierLedger: 'دفتر تامین‌کننده',
    resellerLedger: 'دفتر فروشنده',
    selectSupplier: 'تامین‌کننده را انتخاب کنید',
    selectReseller: 'فروشنده را انتخاب کنید',
    companyName: 'نام شرکت',
    liveCalculation: 'محاسبه زنده',
    welcomeBack: 'خوش آمدید',
    manageYourBusiness: 'کسب و کار شارژ عمده خود را مدیریت کنید',
    phoneRequired: 'تلفن یا ایمیل الزامی است',
    passwordRequired: 'رمز عبور الزامی است',
    loginSuccess: 'ورود موفق!',
    signingIn: 'در حال ورود...',
    logout: 'خروج',
    profile: 'پروفایل',
    settings: 'تنظیمات',
    logoutSuccess: 'خروج موفق',
    searchSuppliers: 'جستجوی تامین‌کنندگان...',
    noSuppliers: 'تامین‌کننده‌ای یافت نشد',
    activate: 'فعال کردن',
    delete: 'حذف',
    previous: 'قبلی',
    next: 'بعدی',
    supplierActivated: 'تامین‌کننده با موفقیت فعال شد',
    supplierDeactivated: 'تامین‌کننده با موفقیت غیرفعال شد',
    supplierDeleted: 'تامین‌کننده با موفقیت حذف شد',
    statusUpdateFailed: 'به‌روزرسانی وضعیت ناموفق بود',
    deleteFailed: 'حذف ناموفق بود',
    viewingSupplier: 'در حال مشاهده جزئیات تامین‌کننده',
    nameRequired: 'نام تامین‌کننده الزامی است',
    supplierPhoneRequired: 'شماره تلفن الزامی است',
    companyRequired: 'نام شرکت الزامی است',
    bonusRequired: 'درصد پاداش الزامی است',
    invalidBonus: 'لطفاً درصد پاداش معتبر وارد کنید',
    supplierUpdated: 'تامین‌کننده با موفقیت به‌روزرسانی شد',
    supplierCreated: 'تامین‌کننده با موفقیت ایجاد شد',
    operationFailed: 'عملیات ناموفق بود',
    editSupplier: 'ویرایش تامین‌کننده',
    phoneHint: 'کد کشور را وارد کنید مانند +93',
    bonusHint: 'درصد پاداش در هر خرید',
    cancel: 'انصراف',
    saving: 'در حال ذخیره...',
    pending: 'در انتظار',
    updateBonus: 'به‌روزرسانی %',
    updateBonusPercentage: 'به‌روزرسانی درصد پاداش',
    percentageUpdated: 'درصد پاداش با موفقیت به‌روزرسانی شد',
    updateFailed: 'به‌روزرسانی درصد پاداش ناموفق بود',
    updating: 'در حال به‌روزرسانی...',
    update: 'به‌روزرسانی',
    searchResellers: 'جستجوی فروشندگان...',
    noResellers: 'فروشنده‌ای یافت نشد',
    resellerActivated: 'فروشنده با موفقیت فعال شد',
    resellerDeactivated: 'فروشنده با موفقیت غیرفعال شد',
    resellerDeleted: 'فروشنده با موفقیت حذف شد',
    viewingReseller: 'در حال مشاهده جزئیات فروشنده',
    cityRequired: 'شهر الزامی است',
    resellerUpdated: 'فروشنده با موفقیت به‌روزرسانی شد',
    resellerCreated: 'فروشنده با موفقیت ایجاد شد',
    editReseller: 'ویرایش فروشنده',
    selectSupplierRequired: 'لطفاً یک تامین‌کننده انتخاب کنید',
    selectResellerRequired: 'لطفاً یک فروشنده انتخاب کنید',
    validAmountRequired: 'لطفاً مبلغ معتبر وارد کنید',
    topupPurchased: 'شارژ با موفقیت خریداری شد',
    topupSold: 'شارژ با موفقیت فروخته شد',
    processing: 'در حال پردازش...',
    discount: 'تخفیف',
    finalAmount: 'مبلغ نهایی',
    referencePlaceholder: 'شماره مرجع را وارد کنید (اختیاری)',
    notesPlaceholder: 'یادداشت وارد کنید (اختیاری)',
    paidAmount: 'مبلغ پرداخت شده',
    paidAmountHint: 'مبلغ پرداخت شده (اختیاری)',
    dueAmount: 'مبلغ باقیمانده',
    paid: 'پرداخت شده',
    checkingStock: 'بررسی موجودی...',
    availableStock: 'موجودی قابل فروش',
    insufficientStock: 'موجودی ناکافی! موجودی: {stock}',
    stockCheckFailed: 'بررسی موجودی ناموفق بود',
    stockWarning: '⚠️ موجودی برای این فروش کافی نیست',
    stockSufficient: '✅ موجودی پس از فروش: {remaining}',
    noTransactions: 'تراکنشی یافت نشد',
    loading: 'در حال بارگذاری...',
    viewAll: 'مشاهده همه',





    validPaidAmountRequired: 'لطفاً یک مبلغ پرداخت معتبر وارد کنید',
    paidExceedsTotal: 'مبلغ پرداخت شده نمی‌تواند از کل شارژ بیشتر باشد',
    amountExceedsStock: 'مبلغ از موجودی انبار بیشتر است ({stock})',

    // Hint Texts
    baseAmountHint: 'این مبلغی است که به تامین‌کننده پرداخت می‌کنید',

    maxPossibleBase: 'حداکثر ممکن',


    paidNow: 'پرداخت شده',
    dueToSupplier: 'بدهی به تامین‌کننده',
    dueFromReseller: 'بدهی فروشنده',


    exceedsStock: 'بیشتر از موجودی!',
    insufficientStockWarning: 'موجودی برای این فروش کافی نیست',
    stockAfterSale: 'موجودی پس از فروش',
    maxAmount: 'حداکثر مبلغ',


    confirmPurchase: 'تایید خرید',
    confirmSale: 'تایید فروش',
    payDue: 'پرداخت بدهی',
    paymentAmount: 'مبلغ پرداخت',
    confirmPayment: 'تایید پرداخت',
    paymentSuccessful: 'پرداخت با موفقیت ثبت شد',
    paymentFailed: 'پرداخت ناموفق بود',
    paymentExceedsDue: 'پرداخت نمی‌تواند از مبلغ بدهی بیشتر باشد ({due})',
    action: 'عملیات',
    pay: 'پرداخت',
    collectDue: 'دریافت بدهی',
    collectionAmount: 'مبلغ دریافت',
    confirmCollection: 'تایید دریافت',
    collectionSuccessful: 'پرداخت با موفقیت دریافت شد',
    collectionFailed: 'دریافت ناموفق بود',
    collectionExceedsDue: 'دریافت نمی‌تواند از مبلغ بدهی بیشتر باشد ({due})',
    collect: 'دریافت',
    dashboard: 'داشبورد',
    loadingDashboard: 'در حال بارگذاری داشبورد',
    pleaseWait: 'لطفاً صبر کنید...',
    totalStock: 'کل موجودی',

    profit: 'سود',
    loss: 'زیان',
    ofTotal: 'از کل',
    highDue: 'بدهی بالا',
    units: 'واحد',
    unitsRemaining: 'واحد باقیمانده',
    due: 'بدهی',
    collections: 'دریافت‌ها',
    today: 'امروز',
    week: 'هفته',
    month: 'ماه',
    thisWeek: 'این هفته',
    thisMonth: 'این ماه',
    revenue: 'درآمد',
    cost: 'هزینه',
    profitMargin: 'حاشیه سود',
    netBonus: 'پاداش خالص',
    overall: 'کلی',
    stockUtilization: 'استفاده از موجودی',
    collectionRate: 'نرخ وصول',
    todayActivity: 'فعالیت امروز',

    dailyTarget: 'هدف روزانه',
    showLess: 'نمایش کمتر',
    showAll: 'نمایش همه',
    alerts: 'هشدارها',
    quickStats: 'آمار سریع',
    activeSuppliers: 'تامین‌کنندگان فعال',
    activeResellers: 'فروشندگان فعال',
    totalTransactions: 'کل تراکنش‌ها',
    avgTransaction: 'میانگین تراکنش',
    viewFullReport: 'مشاهده گزارش کامل',

    justNow: 'همین الان',
    m: 'د',
    h: 'س',
    d: 'ر',

    // Alert Messages
    highSupplierDue: 'بدهی بالای تامین‌کننده',
    highResellerDue: 'بدهی بالای فروشنده',
    lowStock: 'موجودی کم',
    allGood: 'همه چیز خوب است',
    noAlerts: 'در حال حاضر هشداری وجود ندارد',
    payNow: 'پرداخت کن',
    collectNow: 'وصول کن',
    restockNow: 'تامین موجودی',

    // Quick Action Descriptions
    purchaseFromSupplier: 'خرید شارژ از تامین‌کننده',
    sellToReseller: 'فروش شارژ به فروشنده',
    payToSupplier: 'پرداخت به تامین‌کننده',
    collectFromReseller: 'دریافت از فروشنده',
    registerNewSupplier: 'ثبت تامین‌کننده جدید',
    registerNewReseller: 'ثبت فروشنده جدید',
    viewDetailedReports: 'مشاهده گزارش‌های تفصیلی',
    businessAnalytics: 'تحلیل‌های کسب و کار',

    // Performance Overview
    performanceOverview: 'بررسی عملکرد',
    totalRevenue: 'کل درآمد',
    totalCost: 'کل هزینه',

    // Quick Actions
    analytics: 'تحلیل‌ها',

    months: 'ماه',
    export: 'صدور',
    period: 'دوره',
    chartType: 'نوع نمودار',
    metrics: 'معیارها',
    year: 'سال',
    compareWithPreviousYear: 'مقایسه با سال قبل',
    comparisonYear: 'سال مقایسه',
    lastWeek: 'هفته گذشته',
    lastQuarter: 'سه ماهه گذشته',
    custom: 'سفارشی',
    monthlyPerformance: 'عملکرد ماهانه',
    topSuppliers: 'تامین‌کنندگان برتر',
    topResellers: 'فروشندگان برتر',
    dailyBreakdown: 'تجزیه و تحلیل روزانه',
    avgPurchase: 'میانگین خرید',
    avgSale: 'میانگین فروش',
    totalBonusGiven: 'کل پاداش داده شده',
    totalBonusReceived: 'کل پاداش دریافت شده',

    // Chart types
    bar: 'میله‌ای',
    line: 'خطی',
    area: 'مساحتی',
    composed: 'ترکیبی',

    // Metrics
    purchase: 'خرید',

    quarter: 'سه ماهه',


    totalProfit: 'کل سود',


    // Messages
    noData: 'داده‌ای موجود نیست',
    noDataForPeriod: 'برای این دوره داده‌ای موجود نیست',
    exportSuccess: 'صدور با موفقیت انجام شد',
    exportFailed: 'صدور ناموفق بود',

    // Additional
    viewDetails: 'مشاهده جزئیات',
    downloadReport: 'دانلود گزارش',
    printReport: 'چاپ گزارش',
    filters: 'فیلترها',
    refresh: 'تازه سازی',
    applyFilters: 'اعمال فیلترها',
    clearFilters: 'پاک کردن فیلترها',
    dateRange: 'بازه تاریخی',
    startDate: 'تاریخ شروع',
    endDate: 'تاریخ پایان',
    selectPeriod: 'انتخاب دوره',
    showComparison: 'نمایش مقایسه',
    hideComparison: 'مخفی کردن مقایسه',
    previousYear: 'سال قبل',
    currentYear: 'سال جاری',
    growth: 'رشد',
    vsLastYear: 'نسبت به سال قبل',

    // Performance indicators
    highestPerforming: 'بهترین عملکرد',
    lowestPerforming: 'ضعیف‌ترین عملکرد',
    averageTransaction: 'میانگین تراکنش',
    totalBonusImpact: 'تاثیر کل پاداش',
    netProfit: 'سود خالص',
    grossProfit: 'سود ناخالص',

    // Supplier/Reseller stats
    totalPurchases: 'کل خریدها',
    totalSales: 'کل فروش‌ها',
    transactionCount: 'تعداد تراکنش‌ها',
    lastTransaction: 'آخرین تراکنش',
    avgTransactionValue: 'میانگین ارزش تراکنش',

    // Chart labels
    amount: 'مقدار',
    value: 'ارزش',

    // Tooltips
    clickToViewDetails: 'برای مشاهده جزئیات کلیک کنید',
    doubleClickToZoom: 'برای بزرگنمایی دوبار کلیک کنید',
    dragToSelect: 'برای انتخاب محدوده بکشید',

    // Export options
    exportAsCSV: 'صدور به صورت CSV',
    exportAsPDF: 'صدور به صورت PDF',
    exportAsExcel: 'صدور به صورت Excel',
    sendByEmail: 'ارسال با ایمیل',

    // Fullscreen
    enterFullscreen: 'ورود به تمام صفحه',
    exitFullscreen: 'خروج از تمام صفحه',


    completed: 'تکمیل شده',

    // Trends
    increasing: 'صعودی',
    decreasing: 'نزولی',
    stable: 'پایدار',
    volatile: 'نوسانی',

    // Insights
    insights: 'بینش‌ها',
    topPerformer: 'بهترین عملکرد',
    needsAttention: 'نیازمند توجه',
    onTrack: 'در مسیر',
    behindTarget: 'عقب از هدف',

    // Month Names
    january: 'ژانویه',
    february: 'فوریه',
    march: 'مارس',
    april: 'آوریل',
    may: 'می',
    june: 'ژوئن',
    july: 'ژوئیه',
    august: 'اوت',
    september: 'سپتامبر',
    october: 'اکتبر',
    november: 'نوامبر',
    december: 'دسامبر',

    // Short Month Names
    jan: 'ژانویه',
    feb: 'فوریه',
    mar: 'مارس',
    apr: 'آوریل',
    jun: 'ژوئن',
    jul: 'ژوئیه',
    aug: 'اوت',
    sep: 'سپتامبر',
    oct: 'اکتبر',
    nov: 'نوامبر',
    dec: 'دسامبر',
    searchTransactions: 'جستجوی تراکنش‌ها...',
    clear: 'پاک کردن',

    minAmount: 'حداقل مبلغ',
    totalBaseAmount: 'کل پایه',
    totalBonus: 'کل پاداش',


    sale: 'فروش',


    // Status
    partial: 'جزئی',
    totalDue: 'کل بدهی',


    totalAmount: 'مجموع',
    totalSuppliers: 'کل تامین‌کنندگان',

    supplier: 'تامین‌کننده',
    contact: 'تماس',

    actions: 'عملیات',
    currentStock: 'موجودی فعلی',


    // Add/Edit Supplier Page

    addSupplierDescription: 'افزودن تامین‌کننده جدید به شبکه شما',
    editSupplierDescription: 'به‌روزرسانی اطلاعات تامین‌کننده',
    supplierNamePlaceholder: 'نام تامین‌کننده را وارد کنید',
    phonePlaceholder: 'شماره تلفن را وارد کنید',

    companyNamePlaceholder: 'نام شرکت را وارد کنید',


    invalidPhone: 'لطفاً شماره تلفن معتبر وارد کنید',

    bonusMaxExceeded: 'درصد پاداش نمی‌تواند بیشتر از 100٪ باشد',


    paymentAmountPlaceholder: 'مبلغ پرداخت را وارد کنید',

    selectSupplierPlaceholder: 'یک تامین‌کننده انتخاب کنید',





    // Buttons
    buy: 'خرید',


    email: 'ایمیل',
    address: 'آدرس',

    total: 'مجموع',

    time: 'زمان',

    // Supplier Info in Modal
    supplierInfo: 'اطلاعات تامین‌کننده',

    // Form Labels
    enterBaseAmount: 'مبلغ پایه را وارد کنید',
    enterPaidAmount: 'مبلغ پرداخت را وارد کنید (اختیاری)',
    enterReference: 'شماره مرجع را وارد کنید',
    enterNotes: 'یادداشت وارد کنید',

    // Tooltips
    clickToSelect: 'برای انتخاب تامین‌کننده کلیک کنید',
    remainingDue: 'بدهی باقیمانده پس از خرید',

    // Confirmation
    confirmPurchaseMessage: 'آیا از خرید این شارژ مطمئن هستید؟',
    purchaseSummary: 'خلاصه خرید',
    transactionDate: 'تاریخ تراکنش',

    // Success Messages
    purchaseCompleted: 'خرید با موفقیت انجام شد',
    purchaseFailed: 'خرید ناموفق بود. لطفاً دوباره تلاش کنید.',

    // Loading States
    calculating: 'در حال محاسبه...',
    submitting: 'در حال ارسال...',

    // Error States
    errorOccurred: 'خطایی رخ داد',
    networkError: 'خطای شبکه. لطفاً اتصال خود را بررسی کنید.',
    invalidData: 'اطلاعات نامعتبر',
    since: 'از',
    totalBuy: 'کل خرید',
    withBonus: 'با پاداش',
    stock: 'موجودی',
    paymentRatio: 'نرخ پرداخت',
    bonusReceived: 'پاداش دریافت شده',
    created: 'ایجاد شده',

    // Additional Terms
    gridView: 'نمایش شبکه‌ای',
    listView: 'نمایش لیستی',

    lastUpdated: 'آخرین به‌روزرسانی',
    joined: 'پیوسته',
    memberSince: 'عضویت از',

    // Stats Labels
    buyStats: 'آمار خرید',
    paymentStats: 'آمار پرداخت',
    bonusStats: 'آمار پاداش',
    stockStats: 'آمار موجودی',

    // Compact number suffixes
    thousand: 'هزار',
    lakh: 'لک',
    crore: 'کرور',
    million: 'میلیون',
    billion: 'میلیارد',
    totalResellers: 'کل فروشندگان',

    reseller: 'فروشنده',

    received: 'دریافت شده',

    sell: 'فروش',





    bonusGiven: 'پاداش داده شده',
    collectionRatio: 'نرخ وصول',



    // Add/Edit Reseller Page
    addResellerDescription: 'افزودن فروشنده جدید به شبکه شما',
    editResellerDescription: 'به‌روزرسانی اطلاعات فروشنده',
    resellerNamePlaceholder: 'نام فروشنده را وارد کنید',

    cityPlaceholder: 'نام شهر را وارد کنید',

    selectResellerPlaceholder: 'یک فروشنده انتخاب کنید',

    // Stats Labels
    salesStats: 'آمار فروش',

    resellerNotFound: 'فروشنده یافت نشد',
    resellerNotFoundDesc: 'فروشنده مورد نظر شما وجود ندارد یا حذف شده است.',
    backToResellers: 'بازگشت به فروشندگان',
    overview: 'بررسی کلی',
    contactInformation: 'اطلاعات تماس',
    salesSummary: 'خلاصه فروش',
    paymentSummary: 'خلاصه پرداخت',
    transactionHistory: 'تاریخچه تراکنش‌ها',

    average: 'میانگین',
    vsLastMonth: 'نسبت به ماه قبل',
    supplierBreakdown: 'تجزیه و تحلیل تامین‌کنندگان',
    dailySummary: 'خلاصه روزانه',
    summary: 'خلاصه',


    // Additional Stats
    totalWithBonus: 'مجموع با پاداش',

    supplierNotFound: 'تامین‌کننده یافت نشد',
    supplierNotFoundDesc: 'تامین‌کننده مورد نظر شما وجود ندارد یا حذف شده است.',
    backToSuppliers: 'بازگشت به تامین‌کنندگان',

    stockInformation: 'اطلاعات موجودی',

    recentActivity: 'فعالیت اخیر',
    purchaseHistory: 'تاریخچه خرید',

    stockValue: 'ارزش موجودی',
    avgPurchasePrice: 'میانگین قیمت خرید',
    lastPurchase: 'آخرین خرید',
    worth: 'ارزش',
    none: 'هیچ',


    payment: 'پرداخت',
    subscriptionPackages: 'بسته‌های اشتراک',
    choosePackageDescription: 'بسته مناسب برای نیازهای کسب و کار خود را انتخاب کنید',
    totalPackages: 'کل بسته‌ها',
    webPackages: 'بسته‌های وب',
    mobilePackages: 'بسته‌های موبایل',
    featuredPackages: 'بسته‌های ویژه',
    allPackages: 'همه بسته‌ها',
    featured: 'ویژه',
    webOnly: 'فقط وب',
    mobileOnly: 'فقط موبایل',
    bothPlatforms: 'هر دو پلتفرم',
    advancedFilters: 'فیلترهای پیشرفته',
    priceRange: 'محدوده قیمت',
    duration: 'مدت',
    allDurations: 'همه مدت‌ها',
    yearly: 'سالیانه',
    webAccess: 'دسترسی وب',
    mobileAccess: 'دسترسی موبایل',
    fullSupport: 'پشتیبانی ۲۴/۷',
    updatesIncluded: 'به‌روزرسانی رایگان',
    buyNow: 'خرید الآن',
    noPackagesFound: 'بسته‌ای یافت نشد',
    noPackagesDescription: 'هیچ بسته‌ای با فیلترهای فعلی شما مطابقت ندارد. لطفاً معیارهای خود را تنظیم کنید.',

    // Package Features
    package: 'بسته',
    price: 'قیمت',

    paymentMethod: 'روش پرداخت',

    // Buy Package Modal
    buyPackage: 'خرید بسته',
    personalInformation: 'اطلاعات شخصی',
    selectPaymentMethod: 'روش پرداخت را انتخاب کنید',
    fullName: 'نام کامل',
    enterFullName: 'نام کامل خود را وارد کنید',
    enterBusinessName: 'نام کسب و کار خود را وارد کنید (اختیاری)',
    phoneNumber: 'شماره تلفن',
    enterPhoneNumber: 'شماره تلفن خود را وارد کنید',
    enterEmail: 'آدرس ایمیل خود را وارد کنید',
    enterAddress: 'آدرس خود را وارد کنید',
    enterCity: 'شهر خود را وارد کنید',
    additionalNotes: 'یادداشت‌های اضافی',
    acceptTerms: 'من می‌پذیرم',
    termsAndConditions: 'شرایط و ضوابط',
    confirmMessage: 'لطفاً قبل از تایید اطلاعات خود را بررسی کنید. یک ایمیل تایید با دستورالعمل پرداخت دریافت خواهید کرد.',
    back: 'بازگشت',


    // Validation Messages
    fullNameRequired: 'نام کامل الزامی است',
    invalidEmail: 'لطفاً یک آدرس ایمیل معتبر وارد کنید',
    addressRequired: 'آدرس الزامی است',
    paymentMethodRequired: 'لطفاً یک روش پرداخت انتخاب کنید',
    termsRequired: 'شما باید شرایط و ضوابط را بپذیرید',

    // Success Messages
    purchaseSuccessful: 'خرید با موفقیت انجام شد! به زودی یک ایمیل تایید دریافت خواهید کرد.',

    // Payment Methods
    bkash: 'بیکاش',
    nagad: 'ناگاد',
    rocket: 'راکت',
    bankTransfer: 'انتقال بانکی',
    creditCard: 'کارت اعتباری/دبیت',
    cash: 'نقد',

    web: 'وب',
    mobile: 'موبایل',
    min: 'حداقل',
    max: 'حداکثر',

  viewPackages: 'مشاهده بسته‌ها',

  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');
  const isRTL = language === 'ps' || language === 'fa';

  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language, isRTL]);

  const t = (key: string): string => {
    return translations[language][key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, isRTL, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
