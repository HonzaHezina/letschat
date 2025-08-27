<?php
	$page = 'page-hp';

	$header = '';
	$footer = '';

	$body = 'image';
	$menu = '';

	ob_start(); require 'template/header.html.php'; $header = ob_get_contents(); ob_end_clean();
	ob_start(); require 'template/footer.html.php'; $footer = ob_get_contents(); ob_end_clean();

	$content = '';

	ob_start(); require 'template/box2.html.php'; $content .= ob_get_contents(); ob_end_clean();
	ob_start(); require 'template/box4.html.php'; $content .= ob_get_contents(); ob_end_clean();
	ob_start(); require 'template/promo.html.php'; $content .= ob_get_contents(); ob_end_clean();

	require 'template/master.html.php';
?>