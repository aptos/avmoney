module ApplicationHelper
	#
	# about our user
	#
	def current_user
		# @current_user ||= User.find(session[:user_id]) if session[:user_id]

    @current_user ||= User.by_auth_token.key(cookies[:auth_token]).first if cookies[:auth_token]
  end

  def mobile_device?
    logger.info "**** Mobile? #{request.user_agent}"
    if params[:mobile_override]
    	params[:mobile_override] == "1"
    else
    	(request.user_agent =~ /Mobile|webOS/) && (request.user_agent !~ /iPad/)
    end
  end

	#
	# access restrictions
	#

	def admin?
		current_user.admin
	end

	def authenticate_user!
		if !(current_user || auth_with_token)
			redirect_to root_url, :alert => 'You need to sign in for access to this page.'
		end
	end

	def auth_with_token
		authenticate_with_http_token do |token, options|
			session[:user_id] = Setting.find(token).uid rescue nil
			logger.warn "AUTH_WITH_TOKEN: '#{token}'"
		end
		return true if session[:user_id]
	end

  #
  # s3 object delete by url
  #
  def s3_delete object_url
    begin
      key = URI.decode object_url.sub(/^.*\/\/.+?\//,'')
      AWS.s3.buckets[ENV['AWS_S3_BUCKET']].objects[key].delete
    rescue Exception => e
      logger.error "S3 Error: #{e.inspect}"
      return false
    end
  end

end
