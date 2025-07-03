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

const sendVerificationEmail = async (user, verificationToken) => {
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
  
  const mailOptions = {
    from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
    to: user.email,
    subject: 'Vérification de votre email - InsightOne API',
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <img src="${process.env.LOGO_URL}" alt="InsightOne Logo" style="height: 50px;">
        </div>
        <div style="padding: 30px; background-color: white; border-radius: 0 0 8px 8px; border: 1px solid #eee;">
          <h2 style="color: #333;">Bonjour ${user.name},</h2>
          <p style="color: #555;">Merci de vous être inscrit sur InsightOne API ! Pour activer votre compte, veuillez cliquer sur le bouton ci-dessous :</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" style="background-color: #4f46e5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              Vérifier mon email
            </a>
          </div>
          
          <p style="color: #777; font-size: 14px;">Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :</p>
          <p style="word-break: break-all; color: #4f46e5; font-size: 14px; background-color: #f5f5ff; padding: 10px; border-radius: 4px;">${verificationUrl}</p>
          
          <p style="color: #666; font-size: 14px;"><strong>Ce lien expire dans 24 heures.</strong></p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px;">
            Si vous n'avez pas créé de compte sur InsightOne API, ignorez simplement cet email.
          </p>
        </div>
      </div>
    `
  };

  return await sendEmail(mailOptions);
};

const sendResetPasswordEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
  
  const mailOptions = {
    from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
    to: user.email,
    subject: 'Réinitialisation de votre mot de passe - InsightOne API',
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <img src="${process.env.LOGO_URL}" alt="InsightOne Logo" style="height: 50px;">
        </div>
        <div style="padding: 30px; background-color: white; border-radius: 0 0 8px 8px; border: 1px solid #eee;">
          <h2 style="color: #333;">Bonjour ${user.name},</h2>
          <p style="color: #555;">Vous avez demandé une réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
              Réinitialiser mon mot de passe
            </a>
          </div>
          
          <p style="color: #777; font-size: 14px;">Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :</p>
          <p style="word-break: break-all; color: #dc2626; font-size: 14px; background-color: #fff5f5; padding: 10px; border-radius: 4px;">${resetUrl}</p>
          
          <p style="color: #666; font-size: 14px;"><strong>Ce lien expire dans 1 heure.</strong></p>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px;">
            Si vous n'avez pas demandé cette réinitialisation, ignorez simplement cet email. Votre mot de passe restera inchangé.
          </p>
        </div>
      </div>
    `
  };

  return await sendEmail(mailOptions);
};

const sendApiTokenEmail = async ({ email, name, plan, token, expiresAt, isNewToken = false }) => {
  const subject = isNewToken 
    ? `Votre nouveau token API (${plan}) - InsightOne API` 
    : `Votre token API (${plan}) - InsightOne API`;

  const planFeatures = {
    'Basique': ['Accès aux APIs Basiques', 'Limite de 100 requêtes/jour'],
    'Pro': ['Accès aux APIs Basiques et Pro', 'Limite de 1000 requêtes/jour', 'Support prioritaire'],
    'Entreprise': ['Accès à toutes les APIs', 'Requêtes illimitées', 'Support 24/7', 'Accès aux fonctionnalités beta']
  };

  const mailOptions = {
    from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
    to: email,
    subject: subject,
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <img src="${process.env.LOGO_URL}" alt="InsightOne Logo" style="height: 50px;">
        </div>
        <div style="padding: 30px; background-color: white; border-radius: 0 0 8px 8px; border: 1px solid #eee;">
          <h2 style="color: #333;">Bonjour ${name},</h2>
          
          ${isNewToken ? `
            <div style="background-color: #f0fdf4; color: #166534; padding: 15px; border-radius: 6px; margin-bottom: 20px; border: 1px solid #bbf7d0;">
              <h3 style="margin: 0; color: #166534;">Un nouveau token API a été généré pour votre compte</h3>
              <p style="margin: 5px 0 0; font-size: 14px;">Votre ancien token n'est plus valide.</p>
            </div>
          ` : ''}
          
          <p style="color: #555;">Voici les détails de votre ${isNewToken ? 'nouveau ' : ''}token API pour le plan <strong>${plan}</strong> :</p>
          
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #e2e8f0;">
            <p style="margin: 0 0 10px; font-size: 14px; color: #64748b;"><strong>VOTRE TOKEN API :</strong></p>
            <code style="font-family: monospace; word-break: break-all; color: #1e40af; background-color: #eff6ff; padding: 8px 12px; border-radius: 4px; display: block;">${token}</code>
          </div>
          
          <div style="background-color: #f5f3ff; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #ddd6fe;">
            <p style="margin: 0 0 5px; font-size: 14px;"><strong>Date d'expiration :</strong> ${expiresAt}</p>
            <p style="margin: 0; font-size: 14px;"><strong>Mode d'utilisation :</strong> Ajoutez ce token dans le header "Authorization" de vos requêtes</p>
          </div>
          
          <h3 style="color: #333; margin-top: 25px; border-bottom: 1px solid #eee; padding-bottom: 8px;">Fonctionnalités incluses :</h3>
          <ul style="padding-left: 20px; color: #555;">
            ${(planFeatures[plan] || planFeatures['Basique']).map(feat => `<li style="margin-bottom: 8px;">${feat}</li>`).join('')}
          </ul>
          
          <div style="margin-top: 25px; padding: 15px; background-color: #fff7ed; border-radius: 6px; border: 1px solid #fed7aa;">
            <h3 style="color: #9a3412; margin: 0 0 10px; font-size: 16px;">⚠️ Sécurité importante</h3>
            <p style="margin: 0; color: #9a3412; font-size: 14px;">
              Ne partagez jamais ce token avec qui que ce soit. En cas de compromission, générez immédiatement un nouveau token.
            </p>
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #999; font-size: 12px;">
            ${isNewToken ? 
              'Ce token a été généré à votre demande ou pour des raisons de sécurité.' : 
              'Ce token vous a été attribué lors de votre souscription à notre service.'
            }
          </p>
        </div>
      </div>
    `
  };

  return await sendEmail(mailOptions);
};

module.exports = {
  sendVerificationEmail,
  sendResetPasswordEmail,
  sendApiTokenEmail
};