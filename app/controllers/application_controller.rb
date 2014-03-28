class ApplicationController < ActionController::Base
  include ApplicationHelper

  protect_from_forgery
  helper_method :current_user
  helper_method :user_signed_in?
  helper_method :correct_user?
  helper_method :mobile_device?

  # rescue_from Exception, with: :render_500
  rescue_from ActionController::RoutingError, with: :render_404
  rescue_from ActionController::UnknownController, with: :render_404
  rescue_from ::AbstractController::ActionNotFound, with: :render_404

  def routing_error
    raise ActionController::RoutingError.new(params[:path])
  end

  def render_404(exception=nil)
    @not_found_path = exception ? exception.message : "I'm totally lost"
    respond_to do |format|
      format.html { render template: 'errors/not_found', layout: 'layouts/application', status: 404 }
      format.all { render nothing: true, status: 404 }
    end
  end

  def render_500(exception)
    logger.info exception.backtrace.join("\n")
    @the_error = exception.message
    respond_to do |format|
      format.html { render template: 'errors/internal_server_error', layout: 'layouts/application', status: 500 }
      format.all { render nothing: true, status: 500}
    end
  end

  private

  def redis_connect_error(exception)
    logger.error "\n****** ERROR: Redis::CannotConnectError ******\n #{exception.inspect}"
  end
end