class PaymentsController < ApplicationController

  def index
    @payments = Payment.by_client_name.all
    render :json => @payments
  end

  def show
    @payment = Payment.find(params[:id])
    unless @payment
      render :json => { error: "payment not found: #{params[:id]}" }, :status => 404 and return
    end
    render :json => @payment
  end

  def create
    @payment = Payment.new(params[:payment])
    begin
      @payment.save
    rescue Exception => e
      status = 400
      if e.message.include? "Conflict"
        status = 409
      end
      render :json => { error: e.message, payment: @payment }, :status => status and return
    end

    # update invoice status
    invoice = Invoice.find(params[:invoice_id])
    paid = Payment.by_invoice_id.key(params[:invoice_id]).reduce.rows[0]['value']
    if paid ==  invoice.invoice_total
      invoice.update_attributes({ status: "Paid", paid_date: @payment.date, paid: paid })
      invoice.activities.each do |activity|
        if a = Activity.find(activity["_id"])
          a.update_attributes({status: "Paid"})
        end
      end
    else
      invoice.update_attributes({ paid: paid })
    end
    render :json => @payment
  end

  def update
    @payment = Payment.find(params[:id])
    unless @payment
      render :json => { error: "payment not found: #{params[:id]}" }, :status => 404 and return
    end
    @payment.attributes = params[:payment]
    if @payment.save
      render :json => @payment
    else
      respond_with(@payment.errors, status: :unprocessable_entity)
    end
  end

end
