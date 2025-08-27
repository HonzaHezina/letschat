<header class="header<?php echo in_array($page, [ 'page-hp' ]) ? ' margin' : ''; ?>">

	<div class="frame">

		<div class="content">

			<a href="#" class="logo" title="Let's Chat"><img src="/media/custom/header-logo.svg" alt="Let'sChat" title="Let's Chat"></a>

			<nav>

				<ul class="menu">

					<li class="logged"><span class="icon menu icon-chats"></span><a href="#" title="Moje Let's Chatky"<?php echo $menu === 'chats' ? ' class="active"' : ''; ?>>Moje Let's&nbsp;Chatky</a></li>
					<li class="logged"><span class="icon menu icon-profile"></span><a href="#" title="Můj profil"<?php echo $menu === 'profile' ? ' class="active"' : ''; ?>>Můj profil</a></li>
					<li class="wave"></li>
					<li><span class="icon menu icon-help"></span><a href="#" title="Pomoc">Pomoc</a></li>
					<li><span class="icon menu icon-logout"></span><a href="#" title="Odhlášení">Odhlášení</a></li>

				</ul>

				<a id="menu-burger" href="#" class="burger"><img src="/media/icon/menu.svg" alt="Menu" title="Menu"></a>

			</nav>

		</div>

	</div>

</header>

<div id="menu-box">

	<a href="#" class="close"><img src="/media/icon/close.svg" alt="Zavřít" title="Zavřít"></a>

	<ul>

		<li class="logged"><span class="icon menu icon-chats"></span><a href="#" title="Moje Let's Chatky"<?php echo $menu === 'chats' ? ' class="active"' : ''; ?>>Moje Let's&nbsp;Chatky</a></li>
		<li class="logged"><span class="icon menu icon-profile"></span><a href="#" title="Můj profil"<?php echo $menu === 'profile' ? ' class="active"' : ''; ?>>Můj profil</a></li>
		<li><span class="icon menu icon-help"></span><a href="#" title="Pomoc">Pomoc</a></li>
		<li><span class="icon menu icon-logout"></span><a href="#" title="Odhlášení">Odhlášení</a></li>

	</ul>

</div>