define([
    'jquery',
    'react'
], function(
    $,
    React
) {
    'use strict';

    return React.createClass({

        _handleBack: function() {
            window.history.back();
        },
        
        render: function() {
            let lang = this.props.lang.settings.flux_cloud;

            return (
                <div className="cloud terms">
                    <div className="container">
                        <h2>Welcome to FLUX!</h2>
                        <p>Thanks for using our products and services (“Services”). The Services are provided by Flux Inc. ("FLUX"), located at 10F-2, No.125, Section 2., Keelung Rd., Xinyi Dist., Taipei 110, Taiwan.</p>
                        <p>By accessing the Services we assume you accept these terms and conditions in full. Do not continue to use the Services if you do not accept all of the terms and conditions stated on this page. The following terminology applies to these Terms and Conditions, Privacy Statement and Disclaimer Notice and any or all Agreements: "Client", “You” and “Your” refers to you, the person accessing this website and accepting the Company’s terms and conditions. "The Company", “Ourselves”, “We”, “Our” and "Us", refers to our Company. “Party”, “Parties”, or “Us”, refers to both the Client and ourselves, or either the Client or ourselves. All terms refer to the offer, acceptance and consideration of payment necessary to undertake the process of our assistance to the Client in the most appropriate manner, whether by formal meetings of a fixed duration, or any other means, for the express purpose of meeting the Client’s needs in respect of provision of the Company’s stated services/products, in accordance with and subject to, prevailing law of Taiwan. Any use of the above terminology or other words in the singular, plural, capitalisation and/or he/she or they, are taken as interchangeable and therefore as referring to same.</p>

                        <h3>Your FLUX Account</h3>
                        <p>You may need a FLUX Account in order to use some of our Services. You may create your own FLUX Account, or your FLUX Account may be assigned to you by an administrator, such as your employer or educational institution. If you are using a FLUX Account assigned to you by an administrator, different or additional terms may apply and your administrator may be able to access or disable your account.</p>
                        <p>To protect your FLUX Account, keep your password confidential. You are responsible for the activity that happens on or through your FLUX Account. Try not to reuse your FLUX Account password on third-party applications.</p>
                        <p>In order to keep the service quality, FLUX reserves the right to disable accounts that abuse the use of our Services.</p>

                        <h3>Modifying and Terminating our Services</h3>
                        <p>We are constantly changing and improving our Services. We may add or remove functionalities or features, and we may suspend or stop a Service altogether.</p>
                        <p>You can stop using our Services at any time, although we’ll be sorry to see you go. Google may also stop providing Services to you, or add or create new limits to our Services at any time.</p>
                        <p>We believe that you own your data and preserving your access to such data is important. If we discontinue a Service, where reasonably possible, we will give you reasonable advance notice and a chance to get information out of that Service.</p>

                        <h3>Cookies</h3>
                        <p>We employ the use of cookies. By using our Services you consent to the use of cookies in accordance with FLUX’s privacy policy.</p>
                        <p>Most of the modern day interactive web sites use cookies to enable us to retrieve user details for each visit. Cookies are used in some areas of our site to enable the functionality of this area and ease of use for those people visiting. Some of our affiliate / advertising partners may also use cookies.</p>

                        <h3>License</h3>
                        <p>Unless otherwise stated, FLUX and/or it’s licensors own the intellectual property rights for all material on FLUX All intellectual property rights are reserved. You may view and/or print pages from <a href="http://flux3dp.com">http://flux3dp.com</a> for your own personal use subject to restrictions set in these terms and conditions.</p>
                        <p>You must not do the following things without notification in advance:</p>
                        <ul>
                            <li>Republish material from http://flux3dp.com</li>
                            <li>Sell, rent or sub-license material from <a href="http://flux3dp.com">http://flux3dp.com</a></li>
                            <li>Reproduce, duplicate or copy material from <a href="http://flux3dp.com">http://flux3dp.com</a></li>
                            <li>Redistribute content from FLUX (unless content is specifically made for redistribution).</li>
                        </ul>

                        <h3>User Comments</h3>
                        <p>This Agreement shall begin on the date hereof.</p>

                        <p>Certain parts of this website offer the opportunity for users to post and exchange opinions, information, material and data ('Comments') in areas of the website. FLUX does not screen, edit, publish or review Comments prior to their appearance on the website and Comments do not reflect the views or opinions of FLUX, its agents or affiliates. Comments reflect the view and opinion of the person who posts such view or opinion. To the extent permitted by applicable laws FLUX shall not be responsible or liable for the Comments or for any loss cost, liability, damages or expenses caused and or suffered as a result of any use of and/or posting of and/or appearance of the Comments on this website.</p>

                        <p>FLUX reserves the right to monitor all Comments and to remove any Comments which it considers in its absolute discretion to be inappropriate, offensive or otherwise in breach of these Terms and Conditions.</p>

                        <p>You warrant and represent that:</p>

                        <ul>
                            <li>You are entitled to post the Comments on our website and have all necessary licenses and consents to do so;</li>
                            <li>The Comments do not infringe any intellectual property right, including without limitation copyright, patent or trademark, or other proprietary right of any third party;</li>
                            <li>The Comments do not contain any defamatory, libelous, offensive, indecent or otherwise unlawful material or material which is an invasion of privacy</li>
                            <li>The Comments will not be used to solicit or promote business or custom or present commercial activities or unlawful activity.</li>
                            <li>You hereby grant to FLUX a non-exclusive royalty-free license to use, reproduce, edit and authorize others to use, reproduce and edit any of your Comments in any and all forms, formats or media.</li>
                        </ul>

                        <h3>Iframes</h3>

                        <p>Without prior approval and express written permission, you may not create frames around our Web pages or use other techniques that alter in any way the visual presentation or appearance of our Web site.</p>

                        <h3>Content Liability</h3>

                        <p>We shall have no responsibility or liability for any content appearing on your Web site. You agree to indemnify and defend us against all claims arising out of or based upon your Website. No link(s) may appear on any page on your Web site or within any context containing content or materials that may be interpreted as libelous, obscene or criminal, or which infringes, otherwise violates, or advocates the infringement or other violation of, any third party rights.</p>

                        <h3>Reservation of Rights</h3>

                        <p>We reserve the right at any time and in its sole discretion to request that you remove all links or any particular link to our Web site. You agree to immediately remove all links to our Web site upon such request. We also reserve the right to amend these terms and conditions and its linking policy at any time. By continuing to link to our Web site, you agree to be bound to and abide by these linking terms and conditions.</p>

                        <h3>Disclaimer</h3>

                        <p>To the maximum extent permitted by applicable law, we exclude all representations, warranties and conditions relating to our website and the use of this website (including, without limitation, any warranties implied by law in respect of satisfactory quality, fitness for purpose and/or the use of reasonable care and skill). Nothing in this disclaimer will:</p>

                        <p>limit or exclude our or your liability for death or personal injury resulting from negligence;
                            limit or exclude our or your liability for fraud or fraudulent misrepresentation;
                            limit any of our or your liabilities in any way that is not permitted under applicable law; or
                            exclude any of our or your liabilities that may not be excluded under applicable law.
                        The limitations and exclusions of liability set out in this Section and elsewhere in this disclaimer: (a) are subject to the preceding paragraph; and (b) govern all liabilities arising under the disclaimer or in relation to the subject matter of this disclaimer, including liabilities arising in contract, in tort (including negligence) and for breach of statutory duty.</p>

                        <p>To the extent that the website and the information and services on the website are provided free of charge, we will not be liable for any loss or damage of any nature.</p>

                        <h3>Credit &amp; Contact Information</h3>

                        <p>This Terms and conditions page was created at termsandconditionstemplate.com generator. If you have any queries regarding any of our terms, please contact us.</p>
                        <br/><p></p>

                    </div>

                    <div className="footer">
                        <div className="divider">
                            <hr />
                        </div>
                        <div className="actions">
                            <button className="btn btn-cancel" onClick={this._handleBack}>{lang.back}</button>
                        </div>
                    </div>

                </div>
            );
        }
    });
});
