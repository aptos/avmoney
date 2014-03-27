class ActivitiesController < ApplicationController

  def index
    if params[:status] == "Open"
      @activities = Activity.by_status.key("Open").all
    else
      @activities = Activity.by_date.all
    end
    render :json => @activities
  end

  def show
    @activity = Activity.find(params[:id])
    unless @activity
      render :json => { error: "activity not found: #{params[:id]}" }, :status => 404 and return
    end
    render :json => @activity
  end

  def create
    @activity = Activity.new(params[:activity])
    update_projects params[:client_id], params[:project]
    begin
      @activity.save
    rescue Exception => e
      status = 400
      if e.message.include? "Conflict"
        status = 409
      end
      render :json => { error: e.message, activity: @activity }, :status => status and return
    end
    render :json => @activity
  end

  def update
    @activity = Activity.find(params[:id])
    update_projects params[:client_id], params[:project]
    unless @activity
      render :json => { error: "activity not found: #{params[:id]}" }, :status => 404 and return
    end
    @activity.attributes = params[:activity]
    if @activity.save
      render :json => @activity
    else
      respond_with(@activity.errors, status: :unprocessable_entity)
    end
  end

  def destroy
    @activity = Activity.find(params[:id])
    if @activity.attachments
      begin
        key = "uploads/#{params[:id]}"
        AWS.s3.buckets[ENV['AWS_S3_BUCKET']].objects.with_prefix(key).delete_all
      rescue Exception => e
        logger.error "AWS ERROR: while deleting #{key} \n#{e.inspect}"
      end
    end
    @activity.destroy
    render :json => { status: 'Deleted' }
  end

  private

  def update_projects client_id, project
    client = Client.find(client_id)

    unless client.projects.include? project
      client.projects.push(project).uniq!
      client.save
    end
  end

end
