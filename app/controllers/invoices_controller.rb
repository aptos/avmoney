class InvoicesController < ApplicationController

  def index
    @invoices = Invoice.by_name.all
    render :json => @invoices
  end

  def show
    @invoice = Invoice.find(params[:id])
    unless @invoice
      render :json => { error: "invoice not found: #{params[:id]}" }, :status => 404 and return
    end
    render :json => @invoice
  end

  def create
    @invoice = Invoice.new(params[:invoice])
    begin
      @invoice.save
    rescue Exception => e
      status = 400
      if e.message.include? "Conflict"
        status = 409
      end
      render :json => { error: e.message, invoice: @invoice }, :status => status and return
    end

    # increment client invoice count - also makes the client 'active' by update_at
    @client = Client.find(params[:client_id])
    @client.invoice_count += 1
    @client.save

    # update each activity status
    params[:activities].each do |activity|
      if a = Activity.find(activity["_id"])
        a.update_attributes({status: "Invoiced", invoice_id: @invoice._id})
      end
    end

    render :json => @invoice
  end

  def update
    @invoice = Invoice.find(params[:id])
    unless @invoice
      render :json => { error: "invoice not found: #{params[:id]}" }, :status => 404 and return
    end
    @invoice.attributes = params[:invoice]
    if @invoice.save
      render :json => @invoice
    else
      respond_with(@invoice.errors, status: :unprocessable_entity)
    end
  end

end
