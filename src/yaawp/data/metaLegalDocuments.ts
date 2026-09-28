export interface LegalSection {
  id: string;
  title: string;
  content: string[];
  subsections?: {
    id: string;
    title: string;
    content: string[];
  }[];
}

export interface LegalDocument {
  id: 'terms' | 'privacy' | 'cookies' | 'community';
  title: string;
  metaSubtitle: string;
  lastUpdated: string;
  effectiveDate: string;
  introduction: string[];
  sections: LegalSection[];
}

export const YAAWP_TERMS_OF_USE: LegalDocument = {
  id: 'terms',
  title: 'Yaawp Terms of Use',
  metaSubtitle: 'Yaawp Terms of Service',
  lastUpdated: 'January 1, 2026',
  effectiveDate: 'January 1, 2026',
  introduction: [
    'Welcome to Yaawp!',
    'These Terms of Use (or "Terms") govern your use of Yaawp, except where we expressly state that separate terms apply, and provide information about the Yaawp Service (the "Service"), outlined below. When you create a Yaawp account or use Yaawp, you agree to these Terms.',
    'The Yaawp Service is provided to you by Yaawp. These Terms of Use therefore constitute an agreement between you and Yaawp.'
  ],
  sections: [
    {
      id: 'the-service',
      title: '1. The Yaawp Service',
      content: [
        'We agree to provide you with the Yaawp Service. The Service includes all of the Yaawp products, features, applications, services, technologies, and software that we provide to advance Yaawp\'s mission: To bring you closer to the people and things you love. The Service is made up of the following aspects:',
        '• Offering personalized opportunities to create, connect, communicate, discover, and share: People are different. We want to strengthen your relationships through shared experiences you actually care about. So we build systems that try to understand who and what you and others care about, and use that information to help you create, find, view, and share content that is relevant to you and others.',
        '• Fostering a positive, inclusive, and safe environment: We develop and use tools and offer resources to our community members that help to make their experiences positive and inclusive, including when we think they might need help. We also have teams and systems that work to combat abuse and violations of our Terms and policies, as well as harmful and deceptive behavior.',
        '• Developing and using technologies that help us consistently serve our growing community: Organizing and analyzing information for our growing community is central to our Service. A big part of our Service is creating and using cutting-edge technologies that help us personalize, protect, and improve our Service on an incredibly large scale for a broad global community.',
        '• Ensuring a stable global infrastructure for our Service: To provide our global Service, we must store and transfer data across our systems around the world, including outside of your country of residence. This infrastructure may be owned or operated by Yaawp or its affiliates.'
      ]
    },
    {
      id: 'privacy-policy',
      title: '2. The Yaawp Privacy Policy (Data Policy)',
      content: [
        'Providing our Service requires collecting and using your information. The Yaawp Privacy Policy explains how we collect, use, and share information across Yaawp. It also explains the many ways you can control your information, including in the Yaawp Privacy and Security settings.',
        'You must agree to the Yaawp Privacy Policy to use Yaawp. By creating an account or continuing to access the Service, you acknowledge and agree that your data will be processed in accordance with the Privacy Policy.'
      ]
    },
    {
      id: 'your-commitments',
      title: '3. Your Commitments',
      content: [
        'In return for our commitment to provide the Service, we require you to make the below commitments to us.'
      ],
      subsections: [
        {
          id: 'who-can-use',
          title: '3.1 Who Can Use Yaawp',
          content: [
            'We want our Service to be as open and inclusive as possible, but we also want it to be safe, secure, and in accordance with the law. So, we need you to commit to a few restrictions in order to be part of the Yaawp community:',
            '• You must be at least 13 years old or the minimum legal age in your country to use Yaawp. If you are under 13, you are strictly prohibited from creating an account or submitting personal data.',
            '• You must not be prohibited from receiving any aspect of our Service under applicable laws or engaging in payments-related Services if you are on an applicable denied party listing.',
            '• We must not have previously disabled your account for violation of law or any of our policies.',
            '• You must not be a convicted sex offender.'
          ]
        },
        {
          id: 'how-you-cannot-use',
          title: '3.2 How You Cannot Use Yaawp',
          content: [
            'Providing a safe and open Service for a broad community requires that we all do our part. You agree not to engage in the following prohibited activities:',
            '• You can\'t impersonate others or provide inaccurate information: You don\'t have to disclose your identity on Yaawp, but you must provide us with accurate and up to date information (including registration information). Also, you may not impersonate someone or something you aren\'t, and you can\'t create an account for someone else unless you have their express permission.',
            '• You can\'t do anything unlawful, misleading, or fraudulent or for an illegal or unauthorized purpose.',
            '• You can\'t violate (or help or encourage others to violate) these Terms or our policies, including the Yaawp Community Guidelines.',
            '• You can\'t do anything to interfere with or impair the intended operation of the Service, including denial of service attacks, transmission of viruses, trojans, worms, logic bombs, or other malicious code.',
            '• You can\'t attempt to create accounts or access or collect information in unauthorized ways: This includes creating accounts or collecting information in an automated way without our express permission, such as scraping, harvesting, crawlers, spiders, or unauthorized bots.',
            '• You can\'t sell, license, or purchase any account or data obtained from us or our Service: This includes attempts to buy, sell, or transfer any aspect of your account (including your username); solicit, collect, or use login credentials or badges of other users; or request or collect Yaawp usernames, passwords, or misappropriate access tokens.',
            '• You can\'t post someone else\'s private or confidential information without permission or do anything that violates someone else\'s rights, including intellectual property rights (e.g., copyright infringement, trademark infringement, counterfeit, or pirated goods).'
          ]
        }
      ]
    },
    {
      id: 'permissions-you-grant',
      title: '4. Permissions You Grant to Us',
      content: [
        'As part of our agreement, you also grant us permissions that we need to provide the Service.'
      ],
      subsections: [
        {
          id: 'content-license',
          title: '4.1 License to Use Content You Create and Share',
          content: [
            'We do not claim ownership of your content, but you grant us a license to use it.',
            'Nothing is changing about your rights in your content. We do not claim ownership of your photos, videos, captions, or any other content that you post on or through the Service. Instead, when you share, post, or upload content that is covered by intellectual property rights on or in connection with our Service, you hereby grant to us a non-exclusive, royalty-free, transferable, sub-licensable, worldwide license to host, use, distribute, modify, run, copy, publicly perform or display, translate, and create derivative works of your content (consistent with your privacy and application settings).',
            'You can end this license anytime by deleting your content or account. However, content will continue to appear if you shared it with others and they have not deleted it.'
          ]
        },
        {
          id: 'commercial-use',
          title: '4.2 Permission to Use Your Username, Profile Picture, and Relationships with Ads',
          content: [
            'You give us permission to show your username, profile picture, and information about your actions (such as likes) or relationships (such as follows) next to or in connection with accounts, ads, offers, and other sponsored content that you follow or engage with that are displayed on Yaawp, without any compensation to you.',
            'For example, we may show that you liked a sponsored post created by a brand that has paid us to display its ads on Yaawp. As with actions on other content and follows of other accounts, actions on sponsored content and follows of sponsored accounts can be seen only by people who have permission to see that content or follow.'
          ]
        },
        {
          id: 'updates',
          title: '4.3 Software Updates',
          content: [
            'You agree that we can download and install updates to the Service on your device to maintain security, improve features, and introduce new functional modules.'
          ]
        }
      ]
    },
    {
      id: 'rights-retained',
      title: '5. Additional Rights We Retain',
      content: [
        '• If you select a username or similar identifier for your account, we may change or reclaim it if we believe it is appropriate or necessary (for example, if it infringes someone\'s intellectual property or impersonates another user).',
        '• If you use content covered by intellectual property rights that we have and make available in our Service (for example, images, designs, videos, or sounds we provide that you add to content you create or share), we retain all rights to our content (but not yours).',
        '• You can only use our intellectual property and trademarks or similar marks as expressly permitted by our Brand Guidelines or with our prior written permission.'
      ]
    },
    {
      id: 'termination',
      title: '6. Content Removal and Account Suspension or Termination',
      content: [
        'We can remove any content or information you share on the Service if we believe that it violates these Terms of Use, our policies (including our Yaawp Community Guidelines), or we are permitted or required to do so by law.',
        'We can refuse to provide or stop providing all or part of the Service to you (including terminating or disabling your account) immediately if you: clearly, seriously or repeatedly breach these Terms or our policies; repeatedly infringe other people\'s intellectual property rights; or where we are required to do so by law.',
        'If you believe your account has been terminated in error, or you want to disable or permanently delete your account, you can contact our Help Center.'
      ]
    },
    {
      id: 'disclaimers-liability',
      title: '7. Our Agreement and What Happens if We Disagree',
      content: [
        '• DISCLAIMER OF WARRANTIES: Our Service is provided "as is," and we can\'t guarantee it will be safe, secure, or work perfectly all the time. TO THE EXTENT PERMITTED BY LAW, WE ALSO DISCLAIM ALL WARRANTIES, WHETHER EXPRESS OR IMPLIED, INCLUDING THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT.',
        '• LIMITATION ON LIABILITY: Our liability shall be limited to the fullest extent permitted by law, and under no circumstance will we be liable to you for any lost profits, revenues, information, or data, or consequential, special, indirect, exemplary, punitive, or incidental damages arising out of or related to these Terms or the Yaawp Service, even if we have been advised of the possibility of such damages. OUR AGGREGATE LIABILITY ARISING OUT OF OR RELATING TO THESE TERMS OR THE SERVICE WILL NOT EXCEED THE GREATER OF $100 OR THE AMOUNT YOU HAVE PAID US IN THE PAST TWELVE MONTHS.',
        '• DISPUTES AND GOVERNING LAW: For any claim, cause of action, or dispute you have against us that arises out of or relates to these Terms or Yaawp, you agree that it will be resolved exclusively in the applicable courts of competent jurisdiction, and that governing law will apply without regard to conflict of law provisions.'
      ]
    }
  ]
};

export const YAAWP_PRIVACY_POLICY: LegalDocument = {
  id: 'privacy',
  title: 'Yaawp Privacy Policy',
  metaSubtitle: 'How Yaawp collects, uses, shares, retains, and transfers information',
  lastUpdated: 'January 1, 2026',
  effectiveDate: 'January 1, 2026',
  introduction: [
    'The Yaawp Privacy Policy explains what information we collect, how we use and share it, and your rights when you use Yaawp.',
    'We encourage you to read the Policy in full. By creating an account or continuing to use the Service, you understand that your personal data will be handled in accordance with this Policy.'
  ],
  sections: [
    {
      id: 'info-we-collect',
      title: '1. What Information Do We Collect?',
      content: [
        'To provide the Yaawp Service, we must process information about you. The types of information we collect depend on how you use our Service.'
      ],
      subsections: [
        {
          id: 'info-you-provide',
          title: '1.1 Information and Content You Provide',
          content: [
            'We collect the content, communications, and other information you provide when you use Yaawp, including when you sign up for an account, create or share content, and message or communicate with others.',
            '• Account Information: Your name, email address, mobile phone number, username, password, date of birth, and profile picture.',
            '• Content You Create: Posts, photos, videos, reels, stories, comments, captions, audio clips, and messages (including recipient details and time sent).',
            '• Metadata: Information in or about the content you provide, such as the location of a photo or the date a file was created (EXIF data).',
            '• Camera and Creative Tools: Content you capture through our camera features, including mask filters, AR lenses, and stickers.'
          ]
        },
        {
          id: 'networks-connections',
          title: '1.2 Networks and Connections',
          content: [
            'We collect information about the people, accounts, hashtags, and groups you are connected to and how you interact with them across Yaawp, such as people you communicate with the most or groups you are part of.',
            'If you choose to sync your address book, we also collect contact information to help you find people you know.'
          ]
        },
        {
          id: 'your-usage',
          title: '1.3 Your Usage',
          content: [
            'We collect information about how you use Yaawp, such as the types of content you view or engage with; the features you use; the actions you take; the people or accounts you interact with; and the time, frequency, and duration of your activities.',
            'For example, we log when you\'re using and have last used Yaawp, and what posts, videos, and other content you view on Yaawp to power our feed ranking and explore algorithms.'
          ]
        },
        {
          id: 'device-information',
          title: '1.4 Device Information',
          content: [
            'As described below, we collect information from and about the computers, phones, and other web-connected devices you use that integrate with Yaawp:',
            '• Device attributes: Information such as the operating system, hardware and software versions, battery level, signal strength, available storage space, browser type, app and file names, and plugin configurations.',
            '• Device operations: Information about operations and behaviors performed on the device, such as mouse movements (which can help distinguish humans from bots).',
            '• Identifiers: Unique identifiers, device IDs, and other identifiers.',
            '• Network and connections: Information such as language, time zone, IP address, and connection speed.',
            '• Cookie data: Data from cookies stored on your device, including cookie IDs and settings.'
          ]
        }
      ]
    },
    {
      id: 'how-we-use-info',
      title: '2. How Do We Use Your Information?',
      content: [
        'We use the information we have (subject to choices you make) as described below and to provide and support Yaawp and related services.'
      ],
      subsections: [
        {
          id: 'personalization-algorithms',
          title: '2.1 Provide, Personalize, and Improve Our Services',
          content: [
            'We use the information we have to deliver our Service, including to personalize features and content (including your Feed, Reels, Explore tab, and recommendations) and make suggestions for you (such as accounts you may be interested in or topics you may want to follow).',
            'To create personalized experiences that are unique and relevant to you, we use your connections, preferences, interests, and activities based on the data we collect and learn from you; how you use and interact with Yaawp; and the people, places, or things you\'re connected to and interested in.'
          ]
        },
        {
          id: 'safety-security',
          title: '2.2 Promote Safety, Integrity, and Security',
          content: [
            'We use the information we have to verify accounts and activity, combat harmful conduct, detect and prevent spam and other bad experiences, maintain the integrity of our platform, and promote safety and security on and off Yaawp.',
            'For example, we investigate suspicious activity or violations of our Terms or Policies, and detect when someone needs help.'
          ]
        },
        {
          id: 'communication',
          title: '2.3 Communicate with You',
          content: [
            'We use the information we have to communicate with you about Yaawp, and let you know about our policies and terms. We also use your information to respond to you when you contact us.'
          ]
        }
      ]
    },
    {
      id: 'how-info-shared',
      title: '3. How Is Your Information Shared?',
      content: [
        'Your information is shared with others in the following ways:',
        '• People and accounts you share and communicate with: When you share and communicate using Yaawp, you choose the audience for what you share (such as Public posts or Private direct messages).',
        '• Public information: Public information can be seen by anyone, on or off Yaawp, including if they don\'t have an account.',
        '• Service Providers: We transfer information to vendors and service providers who support our business, such as by providing technical infrastructure services, analyzing how our platform is used, providing customer service, or facilitating features.',
        '• Law enforcement or legal requests: We share information with law enforcement or in response to legal requests in accordance with applicable laws to prevent fraud, unauthorized use of our Service, violations of our terms or policies, or other harmful or illegal activity.'
      ]
    },
    {
      id: 'manage-delete-info',
      title: '4. How Can You Manage or Delete Your Information?',
      content: [
        'We provide you with the ability to access, rectify, port, and erase your data.',
        'We store data until it is no longer necessary to provide our services, or until your account is deleted — whichever comes first. This is a case-by-case determination that depends on things like the nature of the data, why it is collected and processed, and relevant legal or operational retention needs.',
        'When you delete your account, we delete things you have posted, such as your photos and status updates, and you won\'t be able to recover that information later.'
      ]
    },
    {
      id: 'global-transfers',
      title: '5. How Do We Operate and Transfer Data as Part of Global Services?',
      content: [
        'We share information globally, both internally within Yaawp and externally with our partners and with those you connect and share with around the world. Your information may be transferred or transmitted to, or stored and processed in, other countries outside of where you live for the purposes as described in this policy.'
      ]
    }
  ]
};

export const YAAWP_COOKIES_POLICY: LegalDocument = {
  id: 'cookies',
  title: 'Yaawp Cookies & Tracking Technologies Policy',
  metaSubtitle: 'How Yaawp uses cookies, pixels, local storage, and similar technologies',
  lastUpdated: 'January 1, 2026',
  effectiveDate: 'January 1, 2026',
  introduction: [
    'Cookies are small pieces of text used to store information on web browsers. Cookies are used to store and receive identifiers and other information on computers, phones, and other devices. Other technologies, including data we store on your web browser or device, identifiers associated with your device, and other software, are used for similar purposes. In this policy, we refer to all of these technologies as "cookies".',
    'This policy explains how we use cookies and the choices you have.'
  ],
  sections: [
    {
      id: 'why-cookies',
      title: '1. Why Do We Use Cookies?',
      content: [
        'Cookies help us provide, protect, and improve the Yaawp experience, such as by personalizing content, tailoring and measuring recommendations, and providing a safer experience.',
        '• Authentication: We use cookies to verify your account and determine when you\'re logged in so we can make it easier for you to access Yaawp and show you the appropriate experience and features.',
        '• Security, site and product integrity: We use cookies to help us keep your account, data, and Yaawp safe and secure. For example, cookies can help us identify and impose additional security measures when someone may be attempting to access an account without authorization.',
        '• Advertising, recommendations, insights and measurement: We use cookies to help us show recommendations and insights for accounts and content you may be interested in.',
        '• Localization and features: We use cookies to enable the functionality that helps us provide Yaawp, such as remembering your preferences and settings.',
        '• Performance and analytics: We use cookies to route traffic between servers and understand how Yaawp is performing, improving load times, and measuring user experience.'
      ]
    },
    {
      id: 'cookie-control',
      title: '2. How Can You Control Your Cookies?',
      content: [
        'You have choices about how cookies are used on your device.',
        'Most browsers allow you to manage your cookie preferences through browser settings. You can choose to block or delete cookies. However, if you disable all cookies, some parts of our Service may not function properly, such as staying logged in or retaining your theme preferences.'
      ]
    }
  ]
};

export const YAAWP_COMMUNITY_STANDARDS: LegalDocument = {
  id: 'community',
  title: 'Yaawp Community Guidelines',
  metaSubtitle: 'Standards for maintaining an authentic and safe community',
  lastUpdated: 'January 1, 2026',
  effectiveDate: 'January 1, 2026',
  introduction: [
    'We want Yaawp to continue to be an authentic and safe place for inspiration and expression. Help us foster this community. Respect everyone on Yaawp, don\'t spam people or post nudity.',
    'By using Yaawp, you agree to these guidelines and our Terms of Use. Overstepping these boundaries may result in deleted content, disabled accounts, or other restrictions.'
  ],
  sections: [
    {
      id: 'authentic-content',
      title: '1. Share Only Photos and Videos that You Own or Have the Right to Share',
      content: [
        'As always, you own the content you post on Yaawp. Remember to post authentic content, and don\'t post anything you\'ve copied or collected from the Internet that you don\'t have the right to post.'
      ]
    },
    {
      id: 'appropriate-content',
      title: '2. Post Photos and Videos that are Appropriate for a Diverse Audience',
      content: [
        'We know that there are times when people might want to share nude images that are artistic or creative in nature, but for a variety of reasons, we don\'t allow nudity on Yaawp. This includes photos, videos, and some digitally-created content that show sexual intercourse, genitals, and close-ups of fully-nude buttocks.'
      ]
    },
    {
      id: 'meaningful-interactions',
      title: '3. Foster Meaningful and Genuine Interactions',
      content: [
        'Help us stay spam-free by not artificially collecting likes, followers, or shares, posting repetitive comments or content, or repeatedly contacting people for commercial purposes without their consent.'
      ]
    },
    {
      id: 'follow-law',
      title: '4. Follow the Law',
      content: [
        'Yaawp is not a place to support or praise terrorism, organized crime, or hate groups. Offering sexual services, buying or selling firearms, alcohol, and tobacco products between private individuals, and buying or selling non-medical or pharmaceutical drugs are also not allowed.'
      ]
    },
    {
      id: 'respect-community',
      title: '5. Respect Other Members of the Yaawp Community',
      content: [
        'We want to foster a positive, diverse community. We remove content that contains credible threats or hate speech, content that targets private individuals to degrade or shame them, personal information meant to blackmail or harass someone, and repeated unwanted messages.'
      ]
    }
  ]
};

// Aliases for backwards compatibility
export const META_TERMS_OF_USE = YAAWP_TERMS_OF_USE;
export const META_PRIVACY_POLICY = YAAWP_PRIVACY_POLICY;
export const META_COOKIES_POLICY = YAAWP_COOKIES_POLICY;
export const META_COMMUNITY_STANDARDS = YAAWP_COMMUNITY_STANDARDS;

export const ALL_LEGAL_DOCUMENTS: Record<string, LegalDocument> = {
  terms: YAAWP_TERMS_OF_USE,
  privacy: YAAWP_PRIVACY_POLICY,
  cookies: YAAWP_COOKIES_POLICY,
  community: YAAWP_COMMUNITY_STANDARDS
};
