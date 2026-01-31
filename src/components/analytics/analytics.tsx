'use client';

import Script from 'next/script';

export function Analytics() {
	return (
		<>
			{/* Yandex.Metrika counter */}
			<Script id="yandex-metrika" strategy="afterInteractive">
				{`
          (function(m,e,t,r,i,k,a){
              m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
              m[i].l=1*new Date();
              for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
              k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
          })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=106549081', 'ym');

          ym(106549081, 'init', {ssr:true, webvisor:true, clickmap:true, ecommerce:"dataLayer", referrer: document.referrer, url: location.href, accurateTrackBounce:true, trackLinks:true});
        `}
			</Script>
			<noscript>
				<div>
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img
						src="https://mc.yandex.ru/watch/106549081"
						style={{ position: 'absolute', left: '-9999px' }}
						alt=""
					/>
				</div>
			</noscript>
			{/* /Yandex.Metrika counter */}

			{/* Google tag (gtag.js) */}
			<Script
				src="https://www.googletagmanager.com/gtag/js?id=G-4MK175YM6P"
				strategy="afterInteractive"
			/>
			<Script id="google-analytics" strategy="afterInteractive">
				{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', 'G-4MK175YM6P');
        `}
			</Script>
		</>
	);
}
