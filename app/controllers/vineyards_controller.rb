class VineyardsController < ApplicationController

  def index
    @vineyards = Vineyard.by_name.stale('update_after').all
    render :json => @vineyards
  end

  def mine
    @vineyards = Vineyard.by_owner.key(current_user.email).all
    render :json => @vineyards
  end

  def show
    @vineyard = Vineyard.find(params[:id])
    unless @vineyard
      render :json => { error: "vineyard not found: #{params[:id]}" }, :status => 404 and return
    end
    render :json => @vineyard
    @vineyard.visit if current_user.email != @vineyard.owner
  end

  def create
    @vineyard = Vineyard.new(params[:vineyard])
    @vineyard.owner ||= current_user.email
    @vineyard.owner_name ||= current_user.name
    begin
      @vineyard.save
    rescue Exception => e
      status = 400
      if e.message.include? "Conflict"
        status = 409
      end
      render :json => { error: e.message, vineyard: @vineyard }, :status => status and return
    end
    render :json => @vineyard
  end

  def update
    @vineyard = Vineyard.find(params[:id])
    unless @vineyard
      render :json => { error: "vineyard not found: #{params[:id]}" }, :status => 404 and return
    end
    unless admin? || @vineyard.owner == current_user.email
      render :json => { error: "Only the Owner may update this Vineyard" }, :status => 400 and return
    end
    @vineyard.attributes = params[:vineyard]
    if @vineyard.save
      render :json => @vineyard
    else
      respond_with(@vineyard.errors, status: :unprocessable_entity)
    end
  end

  def destroy
    @vineyard = Vineyard.find(params[:id])
    if @vineyard.attachments
      begin
        key = "uploads/#{params[:id]}"
        AWS.s3.buckets[ENV['AWS_S3_BUCKET']].objects.with_prefix(key).delete_all
      rescue Exception => e
        logger.error "AWS ERROR: while deleting #{key} \n#{e.inspect}"
      end
    end
    @vineyard.destroy
    render :json => { status: 'Deleted' }
  end

  def get_attachment
    @vineyard = Vineyard.find(params[:id])
    unless @vineyard
      render :json => { error: "vineyard #{params[:id]} not found" }, :status => 404 and return
    end
    key = "uploads/#{params[:id]}/#{params[:filename]}"
    object = AWS.s3.buckets[ENV['AWS_S3_BUCKET']].objects[key]
    url = object.url_for(:get, { :expires => 2.minutes.from_now, :secure => true }).to_s

    redirect_to url
  end

  def delete_attachment
    @vineyard = Vineyard.find(params[:id])
    unless @vineyard.owner == current_user.email
      render :json => { error: "Only Vineyard Owner may delete attachments" }, :status => 400 and return
    end
    key = "uploads/#{params[:id]}/#{params[:filename]}"
    begin
      AWS.s3.buckets[ENV['AWS_S3_BUCKET']].objects[key].delete
    rescue Exception => e
      logger.error "S3 Error: #{e.inspect}"
      render :json => { error: "File delete failed" }, :status => 400 and return
    end
    @vineyard.attachments.delete params[:filename]
    @vineyard.save!
    render :json => @vineyard.attachments
  end
end
