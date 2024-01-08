import Link from 'next/link';

function Eula() {
  return (
    <div className="eula">
      <div className="subheader ">
        <h1 className="subheader-title" style={{ textAlign: 'center' }}>
          <i className="fal fa-info-circle" aria-hidden="true"></i> End User License Agreement
        </h1>
      </div>
      <h3 className="text-uppercase">General</h3>
      <p className="mb-g">
        This End-User License Agreement ("License") is a legal agreement between (a) the End User ("You") and (b)
        Avwxworkshops, Inc.
      </p>
      <h3 className="text-uppercase">Ownership</h3>
      <p className="mb-g">
        The software application (the "Application") and the information within (the "Data") are property of
        Avwxworkshops, Inc. or its partners and third-party providers (collectively "Avwxworkshops"). Both the
        Application and the Data (collectively "EZWxBrief") are protected under copyright laws and international
        copyright treaties. EZWxBrief is licensed, not sold. The structure, organization, code and content of EZWxBrief
        are valuable trade secrets of Avwxworkshops and/or its third-party providers.
      </p>
      <h3 className="text-uppercase">Important</h3>
      <p className="mb-g text-uppercase text-dark" style={{ fontWeight: 'bold' }}>
        PLEASE READ THIS ENTIRE END-USER LICENSE AGREEMENT CAREFULLY BEFORE USING EZWXBRIEF. BY CLICKING THE “I AGREE”
        BUTTON, YOU ACKNOWLEDGE ALL TERMS AND CONDITIONS AND AGREE TO BE BOUND BY THIS LICENSE. USING THIS APPLICATION
        INDICATES YOUR ACKNOWLEDGMENT THAT YOU HAVE READ THIS END-USER LICENSE AGREEMENT AND AGREE TO ITS TERMS AND
        CONDITIONS. IF YOU DO NOT AGREE WITH THE TERMS AND CONDITIONS SET FORTH IN THIS LICENSE, QUIT THE APPLICATION
        IMMEDIATELY.
      </p>
      <h3 className="text-uppercase">Warning</h3>
      <p className="mb-g text-uppercase text-dark" style={{ fontWeight: 'bold' }}>
        EZWXBRIEF IS FOR ENTERTAINMENT AND FAMILIARIZATION PURPOSES ONLY. WHENEVER OR WHEREVER A DISCREPANCY EXISTS
        BETWEEN THE DATA IN EZWXBRIEF AND OFFICIAL DATA, THE LATTER DATA SHALL BE USED. USE AT YOUR OWN RISK.
      </p>
      <h3 className="text-uppercase">LICENSE GRANT</h3>
      <p className="mb-g">
        Avwxworkshops provides you with the Application and the embedded or accompanying Data, including any "online" or
        electronic documentation and printed materials, and grants you a limited, non-exclusive license where you may
        use the Application and Data only as necessary for your personal use to (i) view, and (ii) save, provided that
        you do not remove any copyright notices that appear and do not modify the Application or Data in any way. Your
        use of the Application must also be in accordance with and not violate any usage rules of any third-party
        service provider within the Application. You agree not to otherwise reproduce, copy, modify, decompile,
        disassemble, reverse engineer or create derivative works of any portion of the Application and Data, and you may
        not transfer or distribute it in any form, for any purpose, except to the extent permitted by mandatory law.
      </p>
      <h3 className="text-uppercase">RESTRICTED CONTENT</h3>
      <p className="mb-g">
        Full and unrestricted access within EZWxBrief is only possible with one of the available subscriptions (in-app
        purchases).
      </p>
      <h3 className="text-uppercase">RESTRICTIONS OF USE</h3>
      <p className="mb-g">
        You shall use EZWxBrief strictly in accordance with the terms defined herein. You shall not: (a) decompile,
        reverse engineer, disassemble, attempt to derive the source code of, or decrypt the Application; (b) make any
        modification, adaptation, improvement, enhancement, translation or derivative work from the Application; (c)
        violate any applicable laws, rules or regulations in connection with Your access or use of the Application; (d)
        remove, alter or obscure any proprietary notice (including any notice of copyright or trademark) of
        Avwxworkshops or its affiliates, partners, suppliers or the licensors of the Application; (e) use the
        Application for any revenue generating endeavor, commercial enterprise, or other purpose which it is not
        designed or intended; (f) use the Application for creating a product, service or software that is, directly or
        indirectly, competitive with or in any way a substitute for any services, product or software offered by
        Avwxworkshops; (g) use the Application to send automated queries to any website or to send any unsolicited
        commercial e-mail; or (h) use any proprietary information or interfaces of EZWxBrief or other intellectual
        property of Avwxworkshops in the design, development, manufacture, licensing or distribution of any
        applications, accessories or devices.
      </p>
      <h3 className="text-uppercase">DATA LIBRARY AND USER REPORTING</h3>
      <p className="mb-g">
        <span style={{ fontWeight: 'bold' }}>
          EZWxBrief includes airport data from a Federal Aviation Administration (FAA) repository, maintained through/by
          Avwxworkshops’ headquarters, user reporting, and/or has/have been derived from industry sources and is
          believed to be accurate.
        </span>
        Users are expected and motivated to provide feedback with regards to safety through reporting, such as and not
        limited to, threats and operational points, for the sole purpose of advising all users through EZWxBrief, thus
        enhancing safety. You also agree that all reporting shall be done to reflect own experiences only, as accurately
        as possible. In the interest of flight safety, Avwxworkshops reserves all rights to collect, monitor, vet, edit,
        delete or publish user reports. All reports are to be published in de-identified format. In case of gross
        misconduct like false user-reporting, Avwxworkshops reserves the right to prevent further access to the user
        from EZWxBrief without prior notification.
      </p>
      <h3 className="text-uppercase">INTELLECTUAL PROPERTY</h3>
      <p className="mb-g">
        You acknowledge and agree that all intellectual property rights (including any and all copyrights, patents,
        trademarks, trade secrets, publicity rights and other intellectual property rights) in and to EZWxBrief and all
        elements thereof (including, without limitation, all content, design elements, text, graphics, pictures,
        illustration, animation, video, audiovisual elements, information, applications, software, code, music, sound,
        look-and-feel, and other files contained therein or related thereto), are the sole property of Avwxworkshops,
        its subsidiaries, affiliates, licensors, suppliers or other third parties. Except as provided herein, you do not
        possess, and we do not grant to you, any rights (whether by implication, estoppel, or otherwise) in or to any
        Intellectual Property and all such rights are retained by us and/or other third parties.
      </p>
      <h3 className="text-uppercase">TERMINATION OF USE</h3>
      <p className="mb-g">
        This License will terminate automatically without notice from Avwxworkshops if you breach or fail to comply with
        the terms and conditions of this License, including the payment of any applicable fees, and you agree that in
        any such case Avwxworkshops may in addition to any other remedies it may have at law or in equity, remotely
        disable the Application. Upon termination, you must stop using EZWxBrief and uninstall it from your devices.
      </p>
      <h3 className="text-uppercase">NO WARRANTY</h3>
      <p className="mb-g" style={{ fontWeight: 'bold' }}>
        YOU ACKNOWLEDGE AND AGREE THAT EZWXBRIEF IS PROVIDED ON AN “AS IS” AND “AS AVAILABLE” BASIS AND THAT YOUR USE OF
        OR RELIANCE UPON EZWXBRIEF AND ANY THIRD-PARTY CONTENT AND SERVICES ACCESSED THEREBY IS AT YOUR SOLE RISK AND
        DISCRETION. AVWXWORKSHOPS AND ITS LICENSORS INCLUDING THE LICENSORS, SERVICE PROVIDERS, CHANNEL PARTNERS AND
        SUPPLIERS, AND AFFILIATED COMPANIES OF AVWXWORKSHOPS AND ITS LICENSORS, MAKE NO GUARANTEES, REPRESENTATIONS OR
        WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, ARISING BY LAW OR OTHERWISE, INCLUDING BUT NOT LIMITED TO, CONTENT,
        QUALITY, ACCURACY, COMPLETENESS, EFFECTIVENESS, RELIABILITY, MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
        USEFULNESS, USE OR RESULTS TO BE OBTAINED FROM THE APPLICATION, OR THAT THE DATA WILL BE UNINTERRUPTED OR
        ERROR-FREE. AVWXWORKSHOPS MAKES NO WARRANTY AS TO THE ACCURACY OR COMPLETENESS OF ALL DATA IN THE APPLICATION
        NOR UNINTERRUPTED AND ERROR FREE APPLICATION.
      </p>
      <h3 className="text-uppercase">DISCLAIMER OF WARRANTY</h3>
      <p className="mb-g" style={{ fontWeight: 'bold' }}>
        AVWXWORKSHOPS AND ITS LICENSORS, INCLUDING THE LICENSORS, SERVICE PROVIDERS, CHANNEL PARTNERS, SUPPLIERS AND
        AFFILIATED COMPANIES OF AVWXWORKSHOPS AND ITS LICENSORS, DISCLAIM ANY WARRANTIES, EXPRESS OR IMPLIED, OF
        QUALITY, PERFORMANCE, MERCHANTABILITY, FITNESS FOR ANY PARTICULAR PURPOSE OR NONINFRINGEMENT. NO ORAL OR WRITTEN
        ADVICE OR INFORMATION PROVIDED BY AVWXWORKSHOPS OR ITS SUPPLIERS AND LICENSORS SHALL CREATE A WARRANTY, AND YOU
        ARE NOT ENTITLED TO RELY ON ANY SUCH ADVICE OR INFORMATION. THIS DISCLAIMER OF WARRANTIES IS AN ESSENTIAL
        CONDITION OF THIS LICENSE. SOME COUNTRIES, STATES OR TERRITORIES DO NOT ALLOW CERTAIN WARRANTY EXCLUSIONS, SO TO
        THAT EXTENT THE ABOVE EXCLUSION MAY NOT APPLY TO YOU. THE SOLE AND MAXIMUM RESPONSIBILITY OF AVWXWORKSHOPS AND
        ITS LICENSORS IN THE EVENT OF A WARRANTY FAILURE IS $1.00 USD.
      </p>
      <h3 className="text-uppercase">DISCLAIMER OF LIABILITY</h3>
      <p className="mb-g" style={{ fontWeight: 'bold' }}>
        YOU ASSUME ALL RESPONSIBILITY AND RISK FOR THE USE OF EZWXBRIEF GENERALLY AND IN NO EVENT, INCLUDING BUT NOT
        LIMITED TO NEGLIGENCE, SHALL AVWXWORKSHOPS AND/OR ITS LICENSORS, INCLUDING THE LICENSORS, SERVICE PROVIDERS,
        CHANNEL PARTNERS, SUPPLIERS AND AFFILIATED COMPANIES OF AVWXWORKSHOPS AND ITS LICENSORS BE LIABLE TO YOU: WITH
        RESPECT TO ANY CLAIM, DEMAND OR ACTION, IRRESPECTIVE OF THE NATURE OF THE CAUSE OF THE CLAIM, DEMAND OR ACTION
        ALLEGING ANY LOSS, INJURY OR DAMAGES, DIRECT OR INDIRECT, WHICH MAY RESULT FROM THE USE OR POSSESSION OF THE
        APPLICATION; OR FOR ANY LOSS OF PROFIT, REVENUE, CONTRACTS OR SAVINGS, OR ANY OTHER DIRECT, INDIRECT,
        INCIDENTAL, SPECIAL OR CONSEQUENTIAL DAMAGES ARISING OUT OF YOUR USE OF OR INABILITY TO USE THE APPLICATION, ANY
        DEFECT IN THE DATA OR APPLICATION, OR THE BREACH OF THESE TERMS OR CONDITIONS, WHETHER IN AN ACTION IN CONTRACT
        OR TORT OR BASED ON A WARRANTY, AND WHETHER RESULTING FROM THE USE, MISUSE, OR INABILITY TO USE THE APPLICATION
        OR FROM DEFECTS OR ERRORS IN THE APPLICATION, EVEN IF AVWXWORKSHOPS OR ITS LICENSORS HAVE BEEN ADVISED OF THE
        POSSIBILITY OF SUCH DAMAGES. AVWXWORKSHOPS AND ITS LICENSORS TOTAL AGGREGATE LIABILITY WITH RESPECT TO ITS
        OBLIGATIONS UNDER THIS LICENSE OR OTHERWISE WITH RESPECT TO THE APPLICATION SHALL NOT EXCEED $1.00 USD. SOME
        COUNTRIES, STATES AND TERRITORIES DO NOT ALLOW CERTAIN LIABILITY EXCLUSIONS OR DAMAGES LIMITATIONS, SO TO THAT
        EXTENT THE ABOVE MAY NOT APPLY TO YOU.
      </p>
      <h3 className="text-uppercase">INDEMNITY</h3>
      <p className="mb-g">
        You agree to indemnify, defend and hold Avwxworkshops and its licensors, including the licensors, service
        providers, channel partners, suppliers and affiliated companies of Avwxworkshops and its licensors, and the
        respective officers, directors, employees, shareholders, agents and representatives of Avwxworkshops and its
        licensors, free and harmless from and against any liability, loss, injury (including injuries resulting in
        death), demand, action, cost, expense, or claim of any kind or character, including but not limited to
        attorney’s fees, arising out of or in connection with any use or possession by you of EZWxBrief.
      </p>
      <h3 className="text-uppercase">THIRD PARTY SERVICES</h3>
      <p className="mb-g">
        The application may provide you with an access to third-party websites, databases, software, systems,
        applications, servers or services (“Third-Party Services”). EZWxBrief does not have or maintain any control over
        Third-Party Services and is not responsible for their content, use or operation. By showing information from
        Third-Party Services, EZWxBrief does not give warranty, endorsement or representation of the legality, accuracy,
        quality, or authenticity of content, services or information provided by Third-Party Services. Third-Party
        Services may have their own terms of use and privacy policy. You are responsible for reviewing any terms of use,
        privacy policy or other terms governing your use of these Third-Party Services, which you use at your own risk.
        EZWxBrief disclaims any and all responsibility or liability for any harm resulting from your use of Third-Party
        Services. Avwxworkshops reserves the right to discontinue offering any Third-Party Services if such supplier
        ceases to supply such content or Avwxworkshops’ contract with such supplier terminates for any reason.
      </p>
      <h3 className="text-uppercase">PRIVACY</h3>
      <p className="mb-g">
        You agree that Avwxworkshops reserves the right to collect and use non-personally identifiable technical data
        and information related to your device, system and application, such as the frequency with which you use
        EZWxBrief. This information would be collected anonymously, in a way that does not personally identify you.
        Avwxworkshops may use this information to detect broad user trends and to otherwise enhance the product and
        services.
      </p>
      <h3 className="text-uppercase">TERM</h3>
      <p className="mb-g">
        This License is effective until such time as (i) if applicable, your subscription term is either terminated (by
        you or by Avwxworkshops) or expires, or (ii) Avwxworkshops terminates this License for any reason, including,
        but not limited to, if Avwxworkshops finds that you have violated any of the terms of this License. In addition,
        this License shall terminate immediately upon the termination of an agreement between Avwxworkshops and any
        third party from whom Avwxworkshops (a) obtains services or distribution necessary to support the Application,
        or (b) licenses Data. You agree, upon termination, to destroy all copies of the Data. The Disclaimers of
        Warranty and Liability set out above shall continue in force even after any termination.
      </p>
      <h3 className="text-uppercase">SEVERABILITY</h3>
      <p className="mb-g">
        If any provision of this License is held to be invalid or unenforceable with respect to a party, the remainder
        of this License, or the application of such provision to persons other than those to whom it is held invalid or
        unenforceable shall not be affected and each remaining provision of this License shall be valid and enforceable
        to the fullest extent permitted by law.
      </p>
      <h3 className="text-uppercase">WAIVER</h3>
      <p className="mb-g">
        Except as provided herein, the failure to exercise a right or require performance of an obligation under this
        License shall not affect a party's ability to exercise such right or require such performance at any time
        thereafter nor shall the waiver of a breach constitute waiver of any subsequent breach.
      </p>
      <h3 className="text-uppercase">MODIFICATION OR AMENDMENT</h3>
      <p className="mb-g">
        Avwxworkshops may modify or amend the terms of this License by posting a copy of the modified or amended License
        on the Avwxworkshops EULA website. You will be deemed to have agreed to any such modification or amendment by
        Your decision to continue using the Application following the date in which the modified or amended License is
        posted on Avwxworkshops’ EULA website.
      </p>
      <h3 className="text-uppercase">ASSIGNMENT</h3>
      <p className="mb-g">
        You shall not assign this License or any rights or obligations herein without the prior written consent of
        Avwxworkshops and any attempted assignment in contravention of this provision shall be null and void and of no
        force or effect.
      </p>
      <h3 className="text-uppercase">ENTIRE AGREEMENT</h3>
      <p className="mb-g">
        This License and the terms and conditions contained herein constitute the entire agreement between
        Avwxworkshops, its licensors, including the licensors’ service providers, channel partners, suppliers and
        affiliated companies of Avwxworkshops and its licensors, and you pertaining to the subject matter hereof, and
        supersedes in their entirety any and all written or oral agreements previously existing between us with respect
        to such subject matter.
      </p>
      <h3 className="text-uppercase">TRADEMARKS</h3>
      <p className="mb-g">
        EZWxBrief® and all related logos are trademarks and/or registered trademarks of Avwxworkshops or its licensors.
        These trademarks may not be used without the express permission of Avwxworkshops. No right, title, license, or
        interest to any such trademark is granted hereunder, and you agree that no such right, title, license, or
        interest shall be asserted by you with respect to any such trademark. You agree that you will not these
        trademarks or its licensors’ names or marks or employee names, or adaptations thereof, in any advertising,
        promotional or sales literature without Avwxworkshops’, or its licensors’ prior written consent. You shall
        inform Avwxworkshops promptly in writing of any alleged infringement of these trademarks or its licensors’
        rights and of any evidence thereof.
      </p>
      <h3 className="text-uppercase">GOVERNING LAW AND JURISDICTION</h3>
      <p className="mb-g">
        This License will be deemed entered into in the State of North Carolina and will be governed by and construed
        according to the internal laws of the State of North Carolina applicable to agreements executed and to be
        performed entirely within North Carolina, without regard to conflict of law principles. Any action against any
        party to this License will be commenced only in the federal or state courts in Mecklenburg County, North
        Carolina, which courts will have exclusive jurisdiction over such actions and proceedings and the parties hereby
        irrevocably consent to personal jurisdiction over them by such courts. It is understood and agreed that,
        notwithstanding any other provisions of this License, breach of any provision of this License by you may cause
        Avwxworkshops irreparable damage for which recovery of money damages would be inadequate, and that Avwxworkshops
        will therefore be entitled to obtain timely injunctive relief to protect Avwxworkshops’ rights under this
        License in addition to any and all remedies available at law.
      </p>
      <h3 className="text-uppercase">LEGAL COMPLIANCE</h3>
      <p className="mb-g" style={{ fontWeight: 'bold' }}>
        You must represent and warrant that you are not located in a country that is subject to a U.S. Government
        embargo, or that has been designated by the U.S. Government as a “terrorist supporting” country, and that you
        are not listed on any U.S. Government list of prohibited or restricted parties.
      </p>
      <h3 className="text-uppercase">DEVELOPER INFO</h3>
      <p className="mb-g">
        Avwxworkshops Inc.
        <br />
        Address: 10115 Buggy Horse Road, Charlotte, NC 28277
        <br /> Email:{' '}
        <Link href="mailto:support@ezwxbrief.com" target="_top">
          support@ezwxbrief.com
        </Link>
        <br />
        Website:
        <Link href="https://www.ezwxbrief.com" target="_top">
          www.ezwxbrief.com
        </Link>
      </p>
      <h3 className="text-uppercase">SUPPORT</h3>
      <p className="mb-g">
        Avwxworkshops is solely responsible for providing a maintenance and support services with respect to the
        EZWxBrief. For all queries, complaints or claims regarding EZWxBrief, contact Avwxworkshops e-mail at{' '}
        <Link href="mailto:support@ezwxbrief.com" target="_top">
          support@ezwxbrief.com
        </Link>
        .
      </p>
    </div>
  );
}
export default Eula;
