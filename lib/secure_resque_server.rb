require 'resque/server'
include ApplicationHelper

class SecureResqueServer < Resque::Server
	before do
		unless current_user and current_user.admin
			redirect "/", :alert => "Access denied."
		end
	end
end
