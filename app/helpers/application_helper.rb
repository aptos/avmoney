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
		if !current_user
			redirect_to root_url, :alert => 'You need to sign in for access to this page.'
		end
	end

end

class Array
  def simple_csv
    csv = String.new
    if self[0].is_a?(Array)
      self.each do |r|
        csv += r.simple_csv + "\n"
      end
      return csv
    else
      ary = self.clone
      ary.each_with_index {|c,i| ary[i] = ary[i].gsub("'","^") if c.is_a?(String)}
      ary.each_with_index {|c,i| ary[i] = "'#{c}'" if c.is_a?(String) && c.include?(",") }
      csv = ary.join(",")
      return csv.gsub(/\"|nil/, "").gsub("'","\"").gsub("^","'")
    end
  end
end
