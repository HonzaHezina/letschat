<!DOCTYPE html>

<html lang="cs-CZ">
<head>

	<title>Let's Chat</title>

	<meta charset="utf-8">

	<meta name="robots" content="index,follow">
	<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1">

	<meta name="description" content="">

	<meta property="og:type" content="website">
	<meta property="og:title" content="">
	<meta property="og:description" content="">
	<meta property="og:image" content="">

	<meta name="twitter:title" content="">
	<meta name="twitter:description" content="">

	<link rel="icon" type="image/x-icon" href="/media/favicon/favicon.ico">
	<link rel="icon" type="image/png" sizes="16x16" href="/media/favicon/favicon-16x16.png">
	<link rel="icon" type="image/png" sizes="32x32" href="/media/favicon/favicon-32x32.png">
	<link rel="apple-touch-icon" sizes="180x180" href="/media/favicon/apple-touch-icon.png">

	<link type="text/css" rel="stylesheet" media="all" href="/vendor/jquery/jquery-ui.min.css">
	<link type="text/css" rel="stylesheet" media="all" href="/storage/css/style.css?v=<?php echo uniqid(); ?>">

</head>

<body class="<?php echo $body; ?>">

	<div class="main">

		<?php echo $header; ?>

		<?php echo $content; ?>

		<?php echo $footer; ?>

	</div>

	<script src="/vendor/jquery/jquery.min.js"></script>
	<script src="/vendor/jquery/jquery-ui.min.js"></script>

	<script src="/storage/js/app.js?v=<?php echo uniqid(); ?>"></script>

</body>
</html>