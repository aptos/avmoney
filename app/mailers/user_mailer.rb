class UserMailer < AsyncMailer
  default from: Farmdat::Application.config.notifications[:from]

  @@url = Farmdat::Application.config.notifications[:url]
  @@info = Farmdat::Application.config.notifications[:mailto_info]

  def welcome_email(user_id)
    @user = User.find(user_id)
    @url = @@url
    @feedback_mailto = URI.encode "#{@@info}?subject=#{@user.name} says hi!"
    mail(:to => @user.email, :subject => "Welcome to the Grower's Notebook")
  end

  def password_reset(user_id, token)
    @user = User.find(user_id)
    @token = token
    @url = @@url
    @password_reset_url = "#{@url}/accounts/password_reset/#{@token}"
    @feedback_mailto = URI.encode "#{@@info}?subject=#{@user.name} says hi!"
    mail(:to => @user.email, :subject => "Password Reset Instructions from the Grower's Notebook")
  end
end