import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Privacy Policy - PolystirolHub',
    description: 'Privacy Policy for PolystirolHub',
};

export default function PrivacyPage() {
    return (
        <div className="prose prose-invert max-w-none">
            <h1 className="text-3xl font-bold mb-8 text-white">Политика конфиденциальности</h1>

            <div className="space-y-6 text-white/80">
                <section>
                    <h2 className="text-xl font-semibold text-white mb-3">1. Сбор информации</h2>
                    <p>
                        Мы собираем информацию, когда вы регистрируетесь на нашем сайте, заходите в свой аккаунт и выходите из него. Информация включает ваше имя (никнейм), и, в случае использования сторонних сервисов аутентификации (Twitch, Discord, Steam), общедоступные данные вашего профиля.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-white mb-3">2. Использование информации</h2>
                    <p>
                        Любая информация, которую мы собираем от вас, может быть использована для:
                    </p>
                    <ul className="list-disc pl-5 space-y-1 mt-2">
                        <li>Персонализации вашего опыта и реагирования на ваши индивидуальные потребности</li>
                        <li>Улучшения нашего веб-сайта</li>
                        <li>Улучшения обслуживания клиентов и поддержки</li>
                        <li>Связи с вами по электронной почте (если применимо)</li>
                        <li>Администрирования конкурсов, акций или опросов</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-white mb-3">3. Защита информации</h2>
                    <p>
                        Мы реализуем ряд мер безопасности для обеспечения безопасности вашей личной информации. Мы используем шифрование для защиты конфиденциальной информации, передаваемой онлайн. Мы также защищаем вашу информацию в автономном режиме.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-white mb-3">4. Использование файлов cookie</h2>
                    <p>
                        Мы используем файлы cookie. Файлы cookie - это небольшие файлы, которые сайт или его поставщик услуг передает на жесткий диск вашего компьютера через веб-браузер (если вы разрешаете), что позволяет системам сайта или поставщика услуг распознавать ваш браузер и захватывать и запоминать определенную информацию.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-white mb-3">5. Раскрытие информации третьим лицам</h2>
                    <p>
                        Мы не продаем, не торгуем и не передаем иным образом посторонним лицам вашу личную информацию. Это не относится к доверенным третьим лицам, которые помогают нам в работе нашего веб-сайта, ведении нашего бизнеса или обслуживании вас, при условии, что эти стороны соглашаются сохранять конфиденциальность этой информации.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-white mb-3">6. Согласие</h2>
                    <p>
                        Пользуясь нашим сайтом, вы соглашаетесь с нашей политикой конфиденциальности.
                    </p>
                </section>

                <div className="pt-8 border-t border-white/10 text-sm text-white/50">
                    Последнее обновление: {new Date().toLocaleDateString('ru-RU')}
                </div>
            </div>
        </div>
    );
}
