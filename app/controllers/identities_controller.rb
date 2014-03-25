class IdentitiesController < ApplicationController

  def new
    @identity = env['omniauth.identity']
  end

  def registration_failed
    @identity = env['omniauth.identity']
    logger.error "registration_failed: #{@identity.inspect}, #{@identity.errors.inspect}"
    @messages = @identity.errors.messages.map{|m| m[0].to_s.titleize + ": " + m[1].to_sentence}
  end

end
