<?php
/**
 * Wood & Power - Quote Form Submission Handler
 * processes incoming POST requests, sends an email to info@woodandpower.com, and returns JSON.
 */

header('Content-Type: application/json');

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method Not Allowed'
    ]);
    exit;
}

// Extract and sanitize input fields
$name = isset($_POST['name']) ? strip_tags(trim($_POST['name'])) : '';
$email = isset($_POST['email']) ? filter_var(trim($_POST['email']), FILTER_SANITIZE_EMAIL) : '';
$furnitureType = isset($_POST['furnitureType']) ? strip_tags(trim($_POST['furnitureType'])) : '';
$woodType = isset($_POST['woodType']) ? strip_tags(trim($_POST['woodType'])) : '';
$powerOption = isset($_POST['powerOption']) ? strip_tags(trim($_POST['powerOption'])) : 'none';
$legStyle = isset($_POST['legStyle']) ? strip_tags(trim($_POST['legStyle'])) : '';
$dimensions = isset($_POST['dimensions']) ? strip_tags(trim($_POST['dimensions'])) : '';
$notes = isset($_POST['notes']) ? strip_tags(trim($_POST['notes'])) : '';
$newsletter = isset($_POST['newsletter']) ? 'Yes' : 'No';

// Validation
if (empty($name) || empty($email) || empty($furnitureType) || empty($woodType)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Please fill in all required fields marked with an asterisk (*).'
    ]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Please enter a valid email address.'
    ]);
    exit;
}

// Recipient email
$to = 'todd@webdivision.net';

// Subject
$subject = 'New Commission Request from ' . $name;

// Clean up selection names for email presentation
$stylesMap = [
    'dining-table' => 'Live Edge Dining Table',
    'standing-desk' => 'Smart Stand-Up Desk',
    'sofa-table' => 'C-Frame Sofa Tray Table',
    'bar-stools' => 'Industrial Bar Stools',
    'shelves' => 'Floating Slab Shelves',
    'custom' => 'Fully Custom Piece'
];

$woodsMap = [
    'red-oak' => 'Virginia Red Oak',
    'walnut' => 'Appalachian Walnut',
    'ash' => 'Local Ash',
    'pine' => 'Weathered Heart Pine',
    'maple' => 'Hard Maple'
];

$powerMap = [
    'none' => 'None (Standard Wood)',
    'wireless-qi' => 'Embedded Qi Wireless Charging',
    'flush-outlets' => 'Flush Steel Power Outlet Bezel',
    'hybrid' => 'Hybrid (Qi & AC Outlets)'
];

$legsMap = [
    'steel-trapezoid' => 'Welded Steel Trapezoid Base',
    'steel-legs' => 'Welded Steel Straight Rod Legs',
    'electric-lift' => 'Motorized Electric Standing Base',
    'wood-base' => 'Hand-carved Matching Wood Legs',
    'floating' => 'Floating Invisible Mounts'
];

$prettyStyle = isset($stylesMap[$furnitureType]) ? $stylesMap[$furnitureType] : $furnitureType;
$prettyWood = isset($woodsMap[$woodType]) ? $woodsMap[$woodType] : $woodType;
$prettyPower = isset($powerMap[$powerOption]) ? $powerMap[$powerOption] : $powerOption;
$prettyLeg = isset($legsMap[$legStyle]) ? $legsMap[$legStyle] : $legStyle;

// Construct email body
$emailBody = "==================================================\n";
$emailBody .= "   NEW CUSTOM COMMISSION REQUEST - WOOD & POWER\n";
$emailBody .= "==================================================\n\n";

$emailBody .= "CLIENT DETAILS\n";
$emailBody .= "--------------------------------------------------\n";
$emailBody .= "Name:      " . $name . "\n";
$emailBody .= "Email:     " . $email . "\n\n";

$emailBody .= "COMMISSION SPECIFICATIONS\n";
$emailBody .= "--------------------------------------------------\n";
$emailBody .= "Style:     " . $prettyStyle . "\n";
$emailBody .= "Timber:    " . $prettyWood . "\n";
$emailBody .= "Power:     " . $prettyPower . "\n";
$emailBody .= "Base/Legs: " . $prettyLeg . "\n";
$emailBody .= "Size:      " . (empty($dimensions) ? 'Not specified' : $dimensions) . "\n\n";

$emailBody .= "SPECIAL INSTRUCTIONS & DETAILS\n";
$emailBody .= "--------------------------------------------------\n";
$emailBody .= empty($notes) ? "None specified.\n" : $notes . "\n\n";

$emailBody .= "MARKETING OPT-IN\n";
$emailBody .= "--------------------------------------------------\n";
$emailBody .= "Signed up for updates: " . $newsletter . "\n\n";
$emailBody .= "==================================================\n";

// Set headers to avoid spam detection
$headers = [
    'From' => 'Wood & Power Configurator <noreply@woodandpower.com>',
    'Reply-To' => $name . ' <' . $email . '>',
    'X-Mailer' => 'PHP/' . phpversion()
];

// Send the email
$mailSent = mail($to, $subject, $emailBody, $headers);

if ($mailSent) {
    echo json_encode([
        'success' => true,
        'message' => 'Thank you! Your custom commission request has been recorded.'
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'The server was unable to send the email. Please contact info@woodandpower.com directly.'
    ]);
}
?>
