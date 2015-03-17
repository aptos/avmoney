class InvoicesController < ApplicationController

  def index
    if params[:client]
      @invoices = Invoice.by_client.key(params[:client]).rows
      @invoices.map! {|i| i.merge(i['value'])}
      @invoices.each {|i| i.delete('value')}
    elsif params[:status]
      @invoices = Invoice.by_status.key(params[:status]).rows
      @invoices.map! {|i| i.merge(i['value'])}
      @invoices.each {|i| i.delete('value')}
    else
      @invoices = Invoice.by_name.rows
    end

    render :json => @invoices
  end

  def stats
    client = params[:client] || nil
    render :json => Invoice.stats(client)
  end

  def show
    @invoice = Invoice.find(params[:id])
    unless @invoice
      render :json => { error: "invoice not found: #{params[:id]}" }, :status => 404 and return
    end

    if @invoice.status != 'Paid'
      # pull latest version of each activity
      @invoice.activities.each_index do |idx|
        if a = Activity.find(@invoice.activities[idx]["_id"])
          @invoice.activities[idx] = a
        end
      end

      # calculate totals
      @invoice.update_totals

      @invoice.save!
    end

    respond_to do |format|
      format.pdf {
        @client = Client.find(@invoice.client_id)
        @display_rates = params[:display_rates] && params[:display_rates] == 'true'
        if @invoice.status == 'Proposal'
          @expires = @invoice.open_date + 30.days
        end
        render :pdf => "invoice",
        :margin => { :top => 15 }
      }
      format.all { render :json => @invoice }
    end

  end

  def create
    @invoice = Invoice.new(params[:invoice])
    begin
      @invoice.save!
    rescue Exception => e
      status = 400
      if e.message.include? "Conflict"
        status = 409
      end
      render :json => { error: e.message, invoice: @invoice }, :status => status and return
    end

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
    @invoice.activities = params[:activities]
    params[:po_number] && @invoice.po_number = params[:po_number]
    params[:work_order] && @invoice.work_order = params[:work_order]
    params[:open_date] && @invoice.open_date = params[:open_date]

    # calculate totals
    @invoice.update_totals

    if @invoice.save
      render :json => @invoice
    else
      respond_with(@invoice.errors, status: :unprocessable_entity)
    end

    # update each activity status
    params[:activities].each do |activity|
      if a = Activity.find(activity["_id"])
        a.update_attributes({
          status: "Invoiced",
          invoice_id: @invoice._id,
          notes: activity['notes']
          })
      end
    end

  end

  def destroy
    @invoice = Invoice.find(params[:id])
    unless @invoice
      render :json => { error: "invoice not found: #{params[:id]}" }, :status => 404 and return
    end

    # update each activity status back to open
    @invoice.activities.each do |activity|
      if a = Activity.find(activity["_id"])
        logger.info "Found Activity: #{activity["_id"]}"
        a.update_attributes({status: "Active", invoice_id: nil})
      end
    end

    @invoice.destroy
    render :json => { status: "deleted" }
  end

  private

  def hash_diff(one, other)
    memo = {}
    one.keys.each do |key|
      next if ['date', 'updated_at', 'created_at'].include? key
      unless one[key] == other[key]
        memo[key] = [one[key] => other[key]]
      end
    end
    logger.info memo.inspect if memo.size > 0
    memo.size > 0
  end

end
