import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Terms of Service - PolystirolHub',
    description: 'Terms of Service for PolystirolHub',
};

export default function TermsPage() {
    return (
        <div className="prose prose-invert max-w-none">
            <h1 className="text-3xl font-bold mb-8 text-white">Условия использования</h1>

            <div className="space-y-6 text-white/80">
                <section>
                    <h2 className="text-xl font-semibold text-white mb-3">1. Принятие условий</h2>
                    <p>
                        Заходя на веб-сайт PolystirolHub и используя его, вы соглашаетесь соблюдать эти Условия использования и все применимые законы и правила. Если вы не согласны с каким-либо из этих условий, вам запрещается использовать этот сайт или получать к нему доступ.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-white mb-3">2. Использование лицензии</h2>
                    <p>
                        Разрешается временно загрузить одну копию материалов (информации или программного обеспечения) с веб-сайта PolystirolHub только для личного, некоммерческого временного просмотра. Это предоставление лицензии, а не передача права собственности.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-white mb-3">3. Отказ от ответственности</h2>
                    <p>
                        Материалы на веб-сайте PolystirolHub предоставляются «как есть». PolystirolHub не дает никаких гарантий, выраженных или подразумеваемых, и настоящим отказывается от всех других гарантий, включая, помимо прочего, подразумеваемые гарантии или условия товарной пригодности, пригодности для определенной цели или ненарушения прав интеллектуальной собственности или иных нарушений прав.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-white mb-3">4. Ограничения</h2>
                    <p>
                        Ни при каких обстоятельствах PolystirolHub или его поставщики не несут ответственности за какой-либо ущерб (включая, помимо прочего, ущерб от потери данных или прибыли или из-за прерывания деятельности), возникающий в результате использования или невозможности использования материалов на веб-сайте PolystirolHub.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-white mb-3">5. Точность материалов</h2>
                    <p>
                        Материалы, появляющиеся на веб-сайте PolystirolHub, могут содержать технические, типографские или фотографические ошибки. PolystirolHub не гарантирует, что какие-либо материалы на его веб-сайте являются точными, полными или актуальными.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-white mb-3">6. Ссылки</h2>
                    <p>
                        PolystirolHub не просматривал все сайты, связанные с его веб-сайтом, и не несет ответственности за содержание любого такого связанного сайта. Включение любой ссылки не означает одобрения сайта PolystirolHub. Использование любого такого связанного веб-сайта осуществляется на собственный риск пользователя.
                    </p>
                </section>

                <section>
                    <h2 className="text-xl font-semibold text-white mb-3">7. Изменения</h2>
                    <p>
                        PolystirolHub может пересматривать эти условия использования для своего веб-сайта в любое время без предварительного уведомления. Используя этот веб-сайт, вы соглашаетесь соблюдать текущую версию этих Условий использования.
                    </p>
                </section>

                <div className="pt-8 border-t border-white/10 text-sm text-white/50">
                    Последнее обновление: {new Date().toLocaleDateString('ru-RU')}
                </div>
            </div>
        </div>
    );
}
