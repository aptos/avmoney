class ClientsController < ApplicationController

  def index
    @clients = Client.by_name.all
    if params[:active]
      @clients.delete_if {|client| client.archived }
    end
    render :json => @clients
  end

  def show
    @client = Client.find(params[:id])
    unless @client
      render :json => { error: "client not found: #{params[:id]}" }, :status => 404 and return
    end
    render :json => @client
  end

  def create
    @client = Client.new(params[:client])
    begin
      @client.save!
    rescue Exception => e
      status = 400
      if e.message.include? "Conflict"
        status = 409
      end
      render :json => { error: e.message, client: @client }, :status => status and return
    end
    render :json => @client
  end

  def update
    @client = Client.find(params[:id])
    unless @client
      render :json => { error: "client not found: #{params[:id]}" }, :status => 404 and return
    end
    @client.attributes = params[:client]
    if @client.save!
      render :json => @client
    else
      respond_with(@client.errors, status: :unprocessable_entity)
    end
  end

  def destroy
    @client = Client.find(params[:id])
    @client.destroy
    render :json => { status: 'Deleted' }
  end

  def projects
    @projects = Project.by_client_id.key(params[:id])
    render :json => @projects
  end

  def projects_report
    client_id = params[:id]
    @projects = Project.by_client_id.key(client_id).all.map!(&:to_hash)
    @projects.each do |project|
      project['activities'] = Activity.project_summary client_id, project['name']
    end

    if params[:format] == "csv"
      report = @projects.map{|p| [p['wo_number'], p['name'], p['cap'], p['activities'][:total]]}
      report.unshift ['work order', 'name', 'cap', 'total']
      render text: report.simple_csv
    else
      render :json => @projects
    end

  end

  def update_project
    params[:wo_number] || params[:wo_number] = nil
    params[:po_number] || params[:po_number] = nil
    params[:cap] || params[:cap] = 0
    if params[:_id]
      @project = Project.find(params[:_id])
      unless @project
        render :json => { error: "project not found: #{params[:_id]}" }, :status => 404 and return
      end
      @project.update_attributes({
        name: params[:name],
        wo_number: params[:wo_number],
        po_number: params[:po_number],
        cap: params[:cap]
        })
    else
      @project = Project.create({
        client_id: params[:id],
        name: params[:name],
        wo_number: params[:wo_number],
        po_number: params[:po_number],
        cap: params[:cap]
        })
    end
    render :json => @project
  end

  def next_invoice
    @client = Client.find(params[:id])
    unless @client
      render :json => { error: "client not found: #{params[:id]}" }, :status => 404 and return
    end
    render :json => @client.next_invoice
  end

end
