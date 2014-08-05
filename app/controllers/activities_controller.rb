class ActivitiesController < ApplicationController

  def index
    if params[:status] && params[:client_id]
      @activities = Activity.by_client_id_and_status.key([params[:client_id],params[:status]]).all
    else
      @activities = Activity.by_date.all
    end

    if params[:project]
      @activities = @activities.select {|activity| activity["project"] == params[:project]}
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
    unless @activity.status == 'Active'
      render :json => { error: "Only Active activities may be removed" }, :status => 400 and return
    end
    @activity.destroy
    render :json => { status: 'Deleted' }
  end

  private

  def update_projects client_id, project
    return unless client_id && !project.nil? && project.strip.length >= 1
    logger.info "project #{project.inspect}"
    client = Client.find(client_id)

    unless client.projects.include? project
      client.projects.push(project.strip).uniq!
      client.save
    end
  end

end
