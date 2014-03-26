class ClientsController < ApplicationController

  def index
    @clients = Client.by_name.all
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
      @client.save
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
    if @client.save
      render :json => @client
    else
      respond_with(@client.errors, status: :unprocessable_entity)
    end
  end

  def destroy
    @client = Client.find(params[:id])
    if @client.attachments
      begin
        key = "uploads/#{params[:id]}"
        AWS.s3.buckets[ENV['AWS_S3_BUCKET']].objects.with_prefix(key).delete_all
      rescue Exception => e
        logger.error "AWS ERROR: while deleting #{key} \n#{e.inspect}"
      end
    end
    @client.destroy
    render :json => { status: 'Deleted' }
  end

end
