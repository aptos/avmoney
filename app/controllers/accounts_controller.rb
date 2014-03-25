class AccountsController < ApplicationController

  def signin_page
    @email = params[:auth_key] ? params[:auth_key] : ''
  end

  def create
    if env['omniauth.identity']
      @identity = env['omniauth.identity']
      logger.error "registration_failed: #{@identity.inspect}, #{@identity.errors.inspect}"
      @messages = @identity.errors.messages.map{|m| "<strong>#{m[0].to_s.titleize}:</strong> #{m[1].to_sentence}"}
    end
  end

  def password_recovery
    if params[:auth_key]
      @email = params[:auth_key]
      identity = Identity.by_email.key(@email).first
      if identity
        identity.send_password_reset
        logger.warn "User needs password_recovery: #{@email}"
        @recovery_mail_sent = true
      end
    end
  end

  def password_reset
    @token = params[:token]
    identity = identity_from_token @token
    unless identity
      logger.error "INVALID PASSWORD RESET"
    end
    # render form anyway
  end

  def password_update
    @token = params[:token]
    logger.warn "User attempts to update password"
    identity = identity_from_token @token
    logger.warn "Identity resolved to: #{identity.inspect}"
    if identity
      identity.update_attributes(
        password: params[:password],
        password_confirmation: params[:password_confirmation]
      )
      identity.save!
    else
      logger.error "Password reset failed"
    end
    redirect_to url_for controller: 'accounts', action: 'signin_page', auth_key: identity.email
  end

  private

  def identity_from_token token
    unless identity = Identity.by_password_reset_token.key(token).first
      logger.error "Identity not found in password reset"
      return false
    end
    if identity.password_reset_sent_at < 2.hours.ago
      logger.error "Password reset expired #{identity.password_reset_sent_at}"
      return false
    end
    identity
  end

end
