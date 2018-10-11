class SessionsController < ApplicationController

  def new
    # if params[:provider]
    #   provider = params[:provider]
    #   auth_url = "/auth/#{provider}"
    #   redirect_to auth_url
    # else
    #   logger.info "no provider provided"
    # end
  end

  def create
    # unless ENV['ALLOWED_USERS'].include? env["omniauth.auth"]['info']['email']
    #   redirect_to root_url and return
    # end
    # user = User.from_omniauth(env["omniauth.auth"])
    # cookies.permanent[:auth_token] = user.auth_token
    user = User.by_email.key("andreavollersen@gmail.com").first
    user.visits += 1
    user.save!

    logger.info "Signin Succeeded: #{user.inspect}"
    logger.info "Current User: #{current_user.inspect}"
    url = session[:return_to] || '/#/Activities'
    unless Client.count > 0
      url = '/#/Clients'
    end
    session[:return_to] = nil
    url = root_path if url.eql?('/signout')

    session[:user_id] = user.id
    redirect_to url
  end

  def destroy
    cookies.delete(:auth_token)
    reset_session
    redirect_to root_url
  end

  def failure
    message = "Unknown Error"
    if params[:message]
      message = params[:message].humanize
    end
    redirect_to root_url, :alert => "Authentication error: #{message}"
  end

end