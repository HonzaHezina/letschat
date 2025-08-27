<header class="header<?php echo in_array($page, [ 'page-hp' ]) ? ' margin' : ''; ?>">

	<div class="frame">

		<div class="content">

			<a href="#" class="logo" title="Let's Chat"><img src="/media/custom/header-logo.svg" alt="Let'sChat" title="Let's Chat"></a>

			<nav>

				<ul class="menu">

					<li class="wave"></li>
					<li><span class="icon menu icon-about"></span><a href="#" title="Co je Let's Chat">Co je Let's&nbsp;Chat</a></li>
					<li><span class="icon menu icon-login"></span><a href="#" title="Přihlásit"<?php echo $menu === 'login' ? ' class="active"' : ''; ?>>Přihlásit</a></li>
					<li><span class="icon menu icon-register"></span><a href="#" title="Registrace"<?php echo $menu === 'registration' ? ' class="active"' : ''; ?>>Registrace</a></li>

				</ul>

				<a id="menu-burger" href="#" class="burger"><img src="/media/icon/menu.svg" alt="Menu" title="Menu"></a>

			</nav>

		</div>

	</div>

</header>

<div id="menu-box">

	<a href="#" class="close"><img src="/media/icon/close.svg" alt="Zavřít" title="Zavřít"></a>

	<ul>

		<li><span class="icon menu icon-about"></span><a href="#" title="Co je Let's Chat">Co je Let's&nbsp;Chat</a></li>
		<li><span class="icon menu icon-login"></span><a href="#" title="Přihlásit"<?php echo $menu === 'login' ? ' class="active"' : ''; ?>>Přihlásit</a></li>
		<li><span class="icon menu icon-register"></span><a href="#" title="Registrace"<?php echo $menu === 'registration' ? ' class="active"' : ''; ?>>Registrace</a></li>

	</ul>

</div>