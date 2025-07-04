const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD
    }
  });
};

const sendEmail = async (mailOptions) => {
  const transporter = createTransporter();
  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
};

// Template de base avec le style bg-gray-900
const baseTemplate = (content, subjectLine) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subjectLine}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    body {
      font-family: 'Inter', sans-serif;
      background-color: #111827;
      margin: 0;
      padding: 0;
      color: #f3f4f6;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
    }
    .header {
      background-color: #1f2937;
      padding: 30px 20px;
      text-align: center;
      border-bottom: 1px solid #374151;
    }
    .logo {
      height: 40px;
      margin-bottom: 15px;
    }
    .content {
      background-color: #111827;
      padding: 30px;
      border-radius: 0 0 8px 8px;
    }
    .card {
      background-color: #1f2937;
      border-radius: 50px;
      padding: 25px;
      margin-bottom: 25px;
      color:white;
      border: 1px solid #374151;
    }
    .btn {
      display: inline-block;
      padding: 12px 24px;
      background-color: #4f46e5;
      color: white !important;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 600;
      margin: 15px 0;
    }
    .btn-secondary {
      background-color: #374151;
    }
    .footer {
      text-align: center;
      padding: 20px;
      color: #9ca3af;
      font-size: 12px;
      border-top: 1px solid #374151;
    }
    .ticket-id {
      background-color: #374151;
      padding: 8px 12px;
      border-radius: 4px;
      display: inline-block;
      font-family: monospace;
    }
    .divider {
      height: 1px;
      background-color: #374151;
      margin: 25px 0;
    }
    .text-primary {
      color: #818cf8;
    }
    .text-secondary {
      color: #9ca3af;
    }
    .text-success {
      color: #34d399;
    }
    .text-danger {
      color: #f87171;
    }
    .text-warning {
      color: #fbbf24;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="${process.env.LOGO_URL}" alt="Company Logo" class="logo">
      <h2 style="margin: 0; color: #f3f4f6;">${subjectLine}</h2>
    </div>
    <div class="content">
      ${content}
      <div class="footer">
        <p>© ${new Date().getFullYear()} ${process.env.FROM_NAME}. Tous droits réservés.</p>
        <p>Si vous ne reconnaissez pas cette activité, veuillez <a href="mailto:${process.env.SUPPORT_EMAIL}" style="color: #818cf8;">nous contacter</a> immédiatement.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

// Email de notification pour nouveau ticket
const sendNewTicketEmail = async (user, ticket, isAdmin = false) => {
  const ticketUrl = `${process.env.CLIENT_URL}/tickets/${ticket._id}`;
  const subject = isAdmin 
    ? `Nouveau ticket créé - ${ticket.subject}` 
    : `Votre ticket a été créé - ${ticket.subject}`;

  const content = `
    <div class="card">
      <h3 style="margin-top: 0;">Bonjour ${user.name},</h3>
      <p>${isAdmin 
        ? `Un nouveau ticket a été créé par ${ticket.user.name} et nécessite votre attention.` 
        : `Merci d'avoir créé un nouveau ticket sur notre plateforme. Notre équipe va traiter votre demande rapidement.`
      }</p>
      
      <div style="margin: 20px 0;">
        <p><strong>Sujet :</strong> ${ticket.subject}</p>
        <p><strong>Priorité :</strong> <span class="text-${ticket.priority === 'high' ? 'danger' : ticket.priority === 'medium' ? 'warning' : 'success'}">${ticket.priority}</span></p>
        <p><strong>Catégorie :</strong> ${ticket.category}</p>
        <p><strong>ID du ticket :</strong> <span class="ticket-id">${ticket._id}</span></p>
      </div>
      
      <div style="margin: 25px 0;">
        <a href="${ticketUrl}" class="btn">${isAdmin ? 'Voir le ticket' : 'Suivre mon ticket'}</a>
      </div>
      
      <div class="divider"></div>
      
      <p class="text-secondary">Message original :</p>
      <div style="background-color: #111827; padding: 15px; border-radius: 6px; border: 1px solid #374151;">
        <p style="margin: 0;">${ticket.message}</p>
      </div>
    </div>
    
    ${isAdmin ? `
    <div class="card">
      <h4 style="margin-top: 0;">Actions recommandées</h4>
      <ul style="padding-left: 20px;">
        <li>Répondre dans les 24 heures</li>
        <li>Changer le statut si nécessaire</li>
        <li>Assigner à un collègue si pertinent</li>
      </ul>
    </div>
    ` : ''}
  `;

  const mailOptions = {
    from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
    to: user.email,
    subject: subject,
    html: baseTemplate(content, subject)
  };

  return await sendEmail(mailOptions);
};

// Email de notification pour nouvelle réponse
const sendTicketReplyEmail = async (user, ticket, reply, isAdminReply) => {
  const ticketUrl = `${process.env.CLIENT_URL}/tickets/${ticket._id}`;
  const subject = isAdminReply 
    ? `Nouvelle réponse à votre ticket - ${ticket.subject}` 
    : `Nouvelle réponse de l'utilisateur - ${ticket.subject}`;

  const content = `
    <div class="card">
      <h3 style="margin-top: 0;">Bonjour ${user.name},</h3>
      <p>${isAdminReply 
        ? `Notre équipe a répondu à votre ticket "${ticket.subject}".` 
        : `L'utilisateur ${reply.user.name} a répondu au ticket "${ticket.subject}".`
      }</p>
      
      <div style="margin: 20px 0;">
        <p><strong>Sujet du ticket :</strong> ${ticket.subject}</p>
        <p><strong>Statut :</strong> <span class="text-${ticket.status === 'open' ? 'success' : ticket.status === 'closed' ? 'secondary' : 'warning'}">${ticket.status}</span></p>
        <p><strong>ID du ticket :</strong> <span class="ticket-id">${ticket._id}</span></p>
      </div>
      
      <div style="margin: 25px 0;">
        <a href="${ticketUrl}" class="btn">Voir la réponse</a>
      </div>
      
      <div class="divider"></div>
      
      <p class="text-secondary">Nouvelle réponse :</p>
      <div style="background-color: #111827; padding: 15px; border-radius: 6px; border: 1px solid #374151;">
        <p style="margin: 0;">${reply.content}</p>
      </div>
    </div>
    
    ${isAdminReply ? `
    <div class="card">
      <h4 style="margin-top: 0;">Prochaines étapes</h4>
      <ul style="padding-left: 20px;">
        <li>Si la réponse résout votre problème, vous pouvez fermer le ticket</li>
        <li>Si vous avez besoin de plus d'informations, répondez directement</li>
        <li>Notre équipe reste à votre disposition pour toute question</li>
      </ul>
    </div>
    ` : `
    <div class="card">
      <h4 style="margin-top: 0;">Actions requises</h4>
      <ul style="padding-left: 20px;">
        <li>Veuillez examiner la réponse de l'utilisateur</li>
        <li>Répondre si des informations supplémentaires sont nécessaires</li>
        <li>Mettre à jour le statut du ticket si nécessaire</li>
      </ul>
    </div>
    `}
  `;

  const mailOptions = {
    from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
    to: user.email,
    subject: subject,
    html: baseTemplate(content, subject)
  };

  return await sendEmail(mailOptions);
};
// Email pour nouvelle souscription (à l'admin)
// Modifiez les fonctions existantes pour prendre en compte l'adminUser
const sendNewSubscriptionAdminEmail = async (adminUser, user, plan, subscription) => {
  const adminUrl = `${process.env.ADMIN_URL}/users/${user._id}`;
  const subject = `Nouvelle souscription - ${user.name} (${plan.name})`;

  const content = `
    <div class="card">
      <h3 style="margin-top: 0;">Nouvelle souscription</h3>
      <p>L'utilisateur <strong>${user.name}</strong> (${user.email}) vient de souscrire au plan <strong>${plan.name}</strong>.</p>
      
      <div style="margin: 20px 0;">
        <p><strong>Type de facturation :</strong> ${subscription.billingType === 'annual' ? 'Annuel' : 'Mensuel'}</p>
        <p><strong>Prix :</strong> ${subscription.price} MAD</p>
        <p><strong>Date d'expiration :</strong> ${new Date(subscription.expiresAt).toLocaleDateString('fr-FR')}</p>
        <p><strong>ID de souscription :</strong> <span class="ticket-id">${subscription._id}</span></p>
      </div>
      
      <div style="margin: 25px 0;">
        <a href="${adminUrl}" class="btn">Voir le profil utilisateur</a>
      </div>
      
      <div class="divider"></div>
      
      <h4>Actions recommandées :</h4>
      <ul style="padding-left: 20px;">
        <li>Vérifier le paiement si nécessaire</li>
        <li>Contacter l'utilisateur pour confirmation</li>
        <li>Suivre l'activité de l'utilisateur</li>
      </ul>
    </div>
  `;

  const mailOptions = {
    from: `"${adminUser.name}" <${adminUser.email}>`,
    to: adminUser.email, // Ou une autre adresse si nécessaire
    subject: subject,
    html: baseTemplate(content, subject)
  };

  return await sendEmail(mailOptions);
};
const sendPlanExpiredUserEmail = async (user, plan, subscription) => {
  const renewUrl = `${process.env.CLIENT_URL}/plans`;
  const subject = `Votre abonnement ${plan.name} a expiré`;

  const content = `
    <div class="card">
      <h3 style="margin-top: 0;">Bonjour ${user.name},</h3>
      <p>Votre abonnement au plan <strong>${plan.name}</strong> a expiré le ${new Date(subscription.expiresAt).toLocaleDateString('fr-FR')}.</p>
      
      <div style="margin: 20px 0;">
        <p><strong>Plan :</strong> ${plan.name}</p>
        <p><strong>Type :</strong> ${subscription.billingType === 'annual' ? 'Annuel' : 'Mensuel'}</p>
        <p><strong>ID de souscription :</strong> <span class="ticket-id">${subscription._id}</span></p>
      </div>
      
      <div style="margin: 25px 0;">
        <a href="${renewUrl}" class="btn">Renouveler mon abonnement</a>
      </div>
      
      <div class="divider"></div>
      
      <h4>Que se passe-t-il maintenant ?</h4>
      <ul style="padding-left: 20px;">
        <li>Votre accès aux fonctionnalités premium est suspendu</li>
        <li>Vos données restent sauvegardées pendant 30 jours</li>
        <li>Vous pouvez renouveler à tout moment pour retrouver l'accès</li>
      </ul>
    </div>
    
    <div class="card">
      <h4 style="margin-top: 0;">Besoin d'aide ?</h4>
      <p>Si vous souhaitez discuter de vos options ou avez des questions :</p>
      <a href="mailto:${process.env.SUPPORT_EMAIL}" class="btn btn-secondary">Contacter le support</a>
    </div>
  `;

  const mailOptions = {
    from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
    to: user.email,
    subject: subject,
    html: baseTemplate(content, subject)
  };

  return await sendEmail(mailOptions);
};
const sendPlanExpiredAdminEmail = async (adminUser, user, plan, subscription) => {
  const adminUrl = `${process.env.ADMIN_URL}/users/${user._id}`;
  const subject = `Abonnement expiré - ${user.name} (${plan.name})`;

  const content = `
    <div class="card">
      <h3 style="margin-top: 0;">Abonnement expiré</h3>
      <p>L'abonnement de <strong>${user.name}</strong> (${user.email}) au plan <strong>${plan.name}</strong> a expiré.</p>
      
      <div style="margin: 20px 0;">
        <p><strong>Date d'expiration :</strong> ${new Date(subscription.expiresAt).toLocaleDateString('fr-FR')}</p>
        <p><strong>ID de souscription :</strong> <span class="ticket-id">${subscription._id}</span></p>
        <p><strong>Dernier paiement :</strong> ${subscription.price} MAD (${subscription.billingType === 'annual' ? 'Annuel' : 'Mensuel'})</p>
      </div>
      
      <div style="margin: 25px 0;">
        <a href="${adminUrl}" class="btn">Voir le profil utilisateur</a>
      </div>
      
      <div class="divider"></div>
      
      <h4>Actions recommandées :</h4>
      <ul style="padding-left: 20px;">
        <li>Contacter l'utilisateur pour renouvellement</li>
        <li>Vérifier les tentatives de paiement automatique</li>
        <li>Suivre l'engagement de l'utilisateur</li>
      </ul>
    </div>
  `;

  const mailOptions = {
    from: `"${adminUser.name}" <${adminUser.email}>`,
    to: adminUser.email, // Ou une autre adresse si nécessaire
    subject: subject,
    html: baseTemplate(content, subject)
  };

  return await sendEmail(mailOptions);
};
// Email de notification pour ticket fermé
const sendTicketClosedEmail = async (user, ticket) => {
  const ticketUrl = `${process.env.CLIENT_URL}/tickets/${ticket._id}`;
  const subject = `Votre ticket a été fermé - ${ticket.subject}`;

  const content = `
    <div class="card">
      <h3 style="margin-top: 0;">Bonjour ${user.name},</h3>
      <p>Votre ticket <span class="text-primary">"${ticket.subject}"</span> a été marqué comme <span class="text-secondary">${ticket.status}</span>.</p>
      
      <div style="margin: 20px 0;">
        <p><strong>ID du ticket :</strong> <span class="ticket-id">${ticket._id}</span></p>
        <p><strong>Fermé par :</strong> ${ticket.closedBy.name}</p>
        <p><strong>Date de fermeture :</strong> ${new Date(ticket.closedAt).toLocaleString()}</p>
      </div>
      
      <div style="margin: 25px 0;">
        <a href="${ticketUrl}" class="btn btn-secondary">Voir le ticket</a>
      </div>
      
      <div class="divider"></div>
      
      <p>Si votre problème n'est pas résolu ou si vous avez d'autres questions, vous pouvez :</p>
      <ul style="padding-left: 20px;">
        <li>Réouvrir ce ticket en répondant</li>
        <li>Créer un nouveau ticket</li>
        <li>Contacter notre support directement</li>
      </ul>
    </div>
    
    <div class="card">
      <h4 style="margin-top: 0;">Évaluation de service</h4>
      <p>Nous aimerions connaître votre satisfaction concernant la résolution de ce ticket :</p>
      <div style="text-align: center; margin: 20px 0;">
        <a href="${ticketUrl}?action=feedback" class="btn">Donner votre avis</a>
      </div>
    </div>
  `;

  const mailOptions = {
    from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
    to: user.email,
    subject: subject,
    html: baseTemplate(content, subject)
  };

  return await sendEmail(mailOptions);
};

module.exports = {
  sendEmail,
  sendNewTicketEmail,
  sendTicketReplyEmail,
  sendTicketClosedEmail,
    sendNewSubscriptionAdminEmail,    // Ajouté
  sendPlanExpiredUserEmail,         // Ajouté
  sendPlanExpiredAdminEmail,         // Ajouté
  // Garder les fonctions existantes
  sendVerificationEmail: async (user, verificationToken) => {
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
    const subject = 'Vérification de votre email';

    const content = `
      <div class="card">
        <h3 style="margin-top: 0;">Bonjour ${user.name},</h3>
        <p>Merci de vous être inscrit sur notre plateforme ! Pour activer votre compte, veuillez vérifier votre adresse email.</p>
        
        <div style="margin: 25px 0;">
          <a href="${verificationUrl}" class="btn">Vérifier mon email</a>
        </div>
        
        <p class="text-secondary">Ce lien expirera dans 24 heures. Si vous ne l'utilisez pas à temps, vous devrez en demander un nouveau.</p>
        
        <div class="divider"></div>
        
        <p>Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :</p>
        <p style="word-break: break-all; background-color: #111827; padding: 12px; border-radius: 4px; border: 1px solid #374151;">${verificationUrl}</p>
      </div>
      
      <div class="card">
        <h4 style="margin-top: 0;">Problèmes avec le lien ?</h4>
        <p>Si vous rencontrez des difficultés, essayez ceci :</p>
        <ul style="padding-left: 20px;">
          <li>Assurez-vous que le lien n'est pas coupé</li>
          <li>Essayez de le coller dans une fenêtre de navigation privée</li>
          <li>Contactez notre support si le problème persiste</li>
        </ul>
      </div>
    `;

    const mailOptions = {
      from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
      to: user.email,
      subject: subject,
      html: baseTemplate(content, subject)
    };

    return await sendEmail(mailOptions);
  },
  sendResetPasswordEmail: async (user, resetToken) => {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
    const subject = 'Réinitialisation de votre mot de passe';

    const content = `
      <div class="card">
        <h3 style="margin-top: 0;">Bonjour ${user.name},</h3>
        <p>Vous avez demandé une réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour procéder :</p>
        
        <div style="margin: 25px 0;">
          <a href="${resetUrl}" class="btn">Réinitialiser mon mot de passe</a>
        </div>
        
        <p class="text-secondary">Ce lien expirera dans 1 heure. Si vous ne l'utilisez pas à temps, vous devrez en demander un nouveau.</p>
        
        <div class="divider"></div>
        
        <p>Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :</p>
        <p style="word-break: break-all; background-color: #111827; padding: 12px; border-radius: 4px; border: 1px solid #374151;">${resetUrl}</p>
      </div>
      
      <div class="card">
        <h4 style="margin-top: 0;">Vous n'avez pas demandé cette réinitialisation ?</h4>
        <p>Si vous n'êtes pas à l'origine de cette demande, veuillez :</p>
        <ul style="padding-left: 20px;">
          <li>Ignorer cet email</li>
          <li>Vérifier la sécurité de votre compte</li>
          <li>Nous contacter si vous suspectez une activité suspecte</li>
        </ul>
      </div>
    `;

    const mailOptions = {
      from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
      to: user.email,
      subject: subject,
      html: baseTemplate(content, subject)
    };

    return await sendEmail(mailOptions);
  },
  sendApiTokenEmail: async ({ email, name, plan, token, expiresAt, isNewToken = false }) => {
    const subject = isNewToken 
      ? `Votre nouveau token API (${plan})` 
      : `Votre token API (${plan})`;

    const planFeatures = {
      'Basique': ['Accès aux APIs Basiques', 'Limite de 100 requêtes/jour'],
      'Pro': ['Accès aux APIs Basiques et Pro', 'Limite de 1000 requêtes/jour', 'Support prioritaire'],
      'Entreprise': ['Accès à toutes les APIs', 'Requêtes illimitées', 'Support 24/7', 'Accès aux fonctionnalités beta']
    };

    const content = `
      <div class="card">
        <h3 style="margin-top: 0;">Bonjour ${name},</h3>
        
        ${isNewToken ? `
          <div style="background-color: #1a2e05; color: #84cc16; padding: 15px; border-radius: 6px; margin-bottom: 20px; border: 1px solid #365314;">
            <h4 style="margin: 0; color: #84cc16;">Un nouveau token API a été généré pour votre compte</h4>
            <p style="margin: 5px 0 0; font-size: 14px;">Votre ancien token n'est plus valide.</p>
          </div>
        ` : ''}
        
        <p>Voici les détails de votre ${isNewToken ? 'nouveau ' : ''}token API pour le plan <span class="text-primary">${plan}</span> :</p>
        
        <div style="margin: 20px 0;">
          <p><strong>Votre token API :</strong></p>
          <p style="word-break: break-all; background-color: #111827; padding: 12px; border-radius: 4px; border: 1px solid #374151; font-family: monospace;">${token}</p>
          <p><strong>Date d'expiration :</strong> ${expiresAt}</p>
        </div>
        
        <div style="margin: 25px 0;">
          <a href="${process.env.CLIENT_URL}/api-docs" class="btn btn-secondary">Accéder à la documentation API</a>
        </div>
        
        <div class="divider"></div>
        
        <h4 style="margin-top: 0;">Fonctionnalités incluses :</h4>
        <ul style="padding-left: 20px;">
          ${(planFeatures[plan] || planFeatures['Basique']).map(feat => `<li style="margin-bottom: 8px;">${feat}</li>`).join('')}
        </ul>
      </div>
      
      <div class="card">
        <h4 style="margin-top: 0; color: #f87171;">⚠️ Sécurité importante</h4>
        <p>Ne partagez jamais ce token avec qui que ce soit. En cas de compromission :</p>
        <ul style="padding-left: 20px;">

          <li>Contactez notre support si nécessaire,Pour Générez immédiatement un nouveau token</li>
        </ul>
      </div>
    `;

    const mailOptions = {
      from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
      to: email,
      subject: subject,
      html: baseTemplate(content, subject)
    };

    return await sendEmail(mailOptions);
  }
};